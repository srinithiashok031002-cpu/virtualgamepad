package com.virtualgamepad.companion

import org.java_websocket.WebSocket
import org.java_websocket.handshake.ClientHandshake
import org.java_websocket.server.WebSocketServer
import org.json.JSONObject
import java.net.InetSocketAddress
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress

/**
 * WebSocket server that listens for events from the phone app.
 *
 * JSON message format from phone:
 *   Button: { "type": "button", "bit": 0, "state": 1 }
 *   Axis:   { "type": "axis", "lx": 0.5, "ly": -0.3, "rx": 0.0, "ry": 0.0 }
 *
 * On receive:
 *  1. Forwards to RetroArch UDP (localhost:55400) using RetroArch's
 *     remote input packet format.
 *  2. Also dispatches Android KeyEvents via InputRelay for non-RetroArch apps.
 */
class ControllerServer(port: Int = 8765) : WebSocketServer(InetSocketAddress(port)) {

    // ─── RetroArch UDP ───────────────────────────────────────────────────────
    private val retroArchSocket = try { DatagramSocket() } catch (_: Exception) { null }
    private val retroArchAddress = try { InetAddress.getByName("127.0.0.1") } catch (_: Exception) { null }
    private val RETROARCH_PORT = 55400

    // Current button bitmask (updated on each button event)
    private var buttonMask = 0
    // Last hat value so we can release old direction before pressing new one
    private var prevHat = 8 // 8 = neutral

    override fun onOpen(conn: WebSocket, handshake: ClientHandshake) {
        println("VGP: phone connected from ${conn.remoteSocketAddress}")
    }

    override fun onClose(conn: WebSocket, code: Int, reason: String, remote: Boolean) {
        println("VGP: phone disconnected")
    }

    override fun onMessage(conn: WebSocket, message: String) {
        try {
            val json = JSONObject(message)
            when (json.getString("type")) {
                "button" -> handleButton(json)
                "axis"   -> handleAxis(json)
                "dpad"   -> handleDpad(json)
            }
        } catch (_: Exception) {}
    }

    override fun onError(conn: WebSocket?, ex: Exception) {
        ex.printStackTrace()
    }

    override fun onStart() {
        println("VGP companion: WebSocket server started on port ${address.port}")
    }

    // ─── Button handling ─────────────────────────────────────────────────────

    private fun handleButton(json: JSONObject) {
        val bit     = json.getInt("bit")
        val pressed = json.getInt("state") == 1

        // Update bitmask
        buttonMask = if (pressed) buttonMask or (1 shl bit)
                     else         buttonMask and (1 shl bit).inv()

        // → RetroArch: send full button state
        sendRetroArchButtons(buttonMask)

        // → Android KeyEvent (for non-RetroArch emulators)
        if (bit < InputRelay.BIT_TO_KEYCODE.size) {
            InputRelay.dispatchKey(InputRelay.BIT_TO_KEYCODE[bit], pressed)
        }
    }

    private fun handleDpad(json: JSONObject) {
        val hat = json.getInt("hat")
        // Neutral (8) = release all directions; any other value = press
        if (hat == 8) {
            InputRelay.dispatchHat(prevHat, false)
        } else {
            if (prevHat != 8) InputRelay.dispatchHat(prevHat, false) // release old
            InputRelay.dispatchHat(hat, true)
        }
        prevHat = hat
    }

    private fun handleAxis(json: JSONObject) {
        val lx = json.getDouble("lx").toFloat()
        val ly = json.getDouble("ly").toFloat()
        val rx = json.getDouble("rx").toFloat()
        val ry = json.getDouble("ry").toFloat()
        sendRetroArchAxes(lx, ly, rx, ry)
    }

    // ─── RetroArch UDP protocol ──────────────────────────────────────────────
    //
    // RetroArch Remote Input packet:
    //   int  port    (4 bytes) — player number (0-based)
    //   char device  (1 byte)  — RETRO_DEVICE_JOYPAD = 1
    //   char index   (1 byte)  — 0
    //   char id      (1 byte)  — button id
    //   uint16 state (2 bytes) — 1=pressed, 0=released

    private fun sendRetroArchButtons(mask: Int) {
        for (bit in 0..15) {
            val pressed = (mask shr bit) and 1
            sendRetroArchPacket(device = 1, index = 0, id = bit, state = pressed)
        }
    }

    private fun sendRetroArchAxes(lx: Float, ly: Float, rx: Float, ry: Float) {
        // RETRO_DEVICE_ANALOG = 5
        // index 0 = left stick, index 1 = right stick
        // id 0 = X, id 1 = Y
        // state = axis value mapped to 0x7FFF range
        sendRetroArchPacket(device = 5, index = 0, id = 0, state = (lx * 0x7FFF).toInt())
        sendRetroArchPacket(device = 5, index = 0, id = 1, state = (ly * 0x7FFF).toInt())
        sendRetroArchPacket(device = 5, index = 1, id = 0, state = (rx * 0x7FFF).toInt())
        sendRetroArchPacket(device = 5, index = 1, id = 1, state = (ry * 0x7FFF).toInt())
    }

    private fun sendRetroArchPacket(device: Int, index: Int, id: Int, state: Int) {
        val addr = retroArchAddress ?: return
        val sock = retroArchSocket ?: return
        // Packet: port(4) + device(1) + index(1) + id(1) + state(2) = 9 bytes
        val buf = ByteArray(9)
        buf[0] = 0; buf[1] = 0; buf[2] = 0; buf[3] = 0  // port = 0
        buf[4] = device.toByte()
        buf[5] = index.toByte()
        buf[6] = id.toByte()
        buf[7] = (state and 0xFF).toByte()
        buf[8] = ((state shr 8) and 0xFF).toByte()
        val packet = DatagramPacket(buf, buf.size, addr, RETROARCH_PORT)
        try { sock.send(packet) } catch (_: Exception) {}
    }
}
