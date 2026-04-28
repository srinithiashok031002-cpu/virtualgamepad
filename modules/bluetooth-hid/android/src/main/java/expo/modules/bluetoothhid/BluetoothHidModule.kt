package expo.modules.bluetoothhid

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothHidDevice
import android.bluetooth.BluetoothHidDeviceAppSdpSettings
import android.bluetooth.BluetoothProfile
import android.os.Build
import androidx.annotation.RequiresApi
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import java.util.concurrent.Executor

/**
 * BluetoothHidModule
 *
 * Makes the phone register as a Bluetooth HID gamepad peripheral.
 * The Android TV connects to it like any standard Bluetooth controller.
 *
 * HID Report format (6 bytes):
 *   Byte 0-1  : button bitmask (little-endian 16 bits)
 *   Byte 2    : left stick X   (-127..127, signed)
 *   Byte 3    : left stick Y   (-127..127, signed)
 *   Byte 4    : right stick X  (-127..127, signed)
 *   Byte 5    : right stick Y  (-127..127, signed)
 */
@RequiresApi(Build.VERSION_CODES.P)
class BluetoothHidModule : Module() {

    // ─── HID Descriptor ──────────────────────────────────────────────────────
    private val GAMEPAD_DESCRIPTOR = byteArrayOf(
        0x05, 0x01,             // Usage Page (Generic Desktop)
        0x09, 0x05,             // Usage (Gamepad)
        0xA1.toByte(), 0x01,    // Collection (Application)

        // ── 16 Buttons ───────────────────────────────────────────────────────
        0x05, 0x09,             //   Usage Page (Button)
        0x19, 0x01,             //   Usage Minimum (Button 1)
        0x29, 0x10,             //   Usage Maximum (Button 16)
        0x15, 0x00,             //   Logical Minimum (0)
        0x25, 0x01,             //   Logical Maximum (1)
        0x75, 0x01,             //   Report Size (1)
        0x95.toByte(), 0x10,    //   Report Count (16)
        0x81.toByte(), 0x02,    //   Input (Data, Variable, Absolute)

        // ── 4 Analog Axes (LX, LY, RX, RY) ──────────────────────────────────
        0x05, 0x01,             //   Usage Page (Generic Desktop)
        0x09, 0x30,             //   Usage (X)
        0x09, 0x31,             //   Usage (Y)
        0x09, 0x32,             //   Usage (Z)
        0x09, 0x35,             //   Usage (Rz)
        0x15, 0x81.toByte(),    //   Logical Minimum (-127)
        0x25, 0x7F,             //   Logical Maximum (127)
        0x75, 0x08,             //   Report Size (8)
        0x95.toByte(), 0x04,    //   Report Count (4)
        0x81.toByte(), 0x02,    //   Input (Data, Variable, Absolute)

        0xC0.toByte()           // End Collection
    )

    // SUBCLASS1_GAMEPAD = 0x08 (HID Device Sub-Class for Gamepads)
    private val SDP_SETTINGS = BluetoothHidDeviceAppSdpSettings(
        "VirtualGamePad",
        "Virtual Game Controller",
        "VirtualGamePad",
        0x08.toByte(),   // BluetoothHidDevice.SUBCLASS1_GAMEPAD
        GAMEPAD_DESCRIPTOR
    )

    // ─── State ────────────────────────────────────────────────────────────────
    private var hidDevice: BluetoothHidDevice? = null
    private var connectedHost: BluetoothDevice? = null
    private val adapter: BluetoothAdapter? get() = BluetoothAdapter.getDefaultAdapter()

    override fun definition() = ModuleDefinition {
        Name("BluetoothHidModule")

        Events("onConnectionStateChange")

        // ── startAdvertising ────────────────────────────────────────────────
        AsyncFunction("startAdvertising") { promise: Promise ->
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
                promise.reject("UNSUPPORTED", "Requires Android 9+", null)
                return@AsyncFunction
            }
            val bt = adapter
            if (bt == null || !bt.isEnabled) {
                promise.reject("BT_DISABLED", "Bluetooth is not enabled", null)
                return@AsyncFunction
            }

            bt.getProfileProxy(appContext.reactContext!!, object : BluetoothProfile.ServiceListener {
                override fun onServiceConnected(profile: Int, proxy: BluetoothProfile) {
                    val hid = proxy as BluetoothHidDevice
                    hidDevice = hid
                    // Use Executor SAM constructor (explicit type, avoids Kotlin 2.x inference issue)
                    val mainExecutor: Executor = Executor { runnable -> runnable.run() }
                    hid.registerApp(
                        SDP_SETTINGS, null, null,
                        mainExecutor,
                        object : BluetoothHidDevice.Callback() {
                            override fun onAppStatusChanged(pluggedDevice: BluetoothDevice?, registered: Boolean) {}

                            override fun onConnectionStateChanged(device: BluetoothDevice, state: Int) {
                                val connected = state == BluetoothProfile.STATE_CONNECTED
                                connectedHost = if (connected) device else null
                                sendEvent("onConnectionStateChange", mapOf(
                                    "deviceId" to device.address,
                                    "deviceName" to (device.name ?: ""),
                                    "connected" to connected
                                ))
                            }
                        }
                    )
                    // Return list of bonded devices
                    val bonded = bt.bondedDevices.map { d ->
                        mapOf("id" to d.address, "name" to (d.name ?: ""))
                    }
                    promise.resolve(bonded)
                }

                override fun onServiceDisconnected(profile: Int) {
                    hidDevice = null
                }
            }, BluetoothProfile.HID_DEVICE)
        }

        // ── stopAdvertising ─────────────────────────────────────────────────
        AsyncFunction("stopAdvertising") { promise: Promise ->
            hidDevice?.unregisterApp()
            adapter?.closeProfileProxy(BluetoothProfile.HID_DEVICE, hidDevice)
            hidDevice = null
            promise.resolve(null)
        }

        // ── connect ─────────────────────────────────────────────────────────
        AsyncFunction("connect") { deviceId: String, promise: Promise ->
            val device = adapter?.getRemoteDevice(deviceId)
            if (device == null) {
                promise.reject("NOT_FOUND", "Device $deviceId not found", null)
                return@AsyncFunction
            }
            hidDevice?.connect(device)
            promise.resolve(null)
        }

        // ── disconnect ──────────────────────────────────────────────────────
        AsyncFunction("disconnect") { promise: Promise ->
            connectedHost?.let { hidDevice?.disconnect(it) }
            connectedHost = null
            promise.resolve(null)
        }

        // ── sendReport ──────────────────────────────────────────────────────
        AsyncFunction("sendReport") { buttons: Int, lx: Int, ly: Int, rx: Int, ry: Int, promise: Promise ->
            val host = connectedHost
            val hid = hidDevice
            if (host == null || hid == null) {
                promise.resolve(null) // silently drop if not connected
                return@AsyncFunction
            }
            val report = ByteArray(6)
            report[0] = (buttons and 0xFF).toByte()
            report[1] = ((buttons shr 8) and 0xFF).toByte()
            report[2] = lx.toByte()
            report[3] = ly.toByte()
            report[4] = rx.toByte()
            report[5] = ry.toByte()
            hid.sendReport(host, 0, report)
            promise.resolve(null)
        }
    }
}
