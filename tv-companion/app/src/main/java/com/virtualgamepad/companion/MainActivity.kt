package com.virtualgamepad.companion

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.FragmentActivity
import java.net.NetworkInterface

/**
 * Launcher activity for the VGP TV Companion.
 * Shows the device's local IP address and a Start/Stop button for the server.
 */
class MainActivity : FragmentActivity() {

    private var service: ControllerService? = null
    private var bound = false

    private lateinit var tvStatus: TextView
    private lateinit var tvIp: TextView
    private lateinit var btnToggle: Button

    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName, binder: IBinder) {
            service = (binder as ControllerService.LocalBinder).getService()
            bound = true
            updateUi()
        }
        override fun onServiceDisconnected(name: ComponentName) {
            service = null
            bound = false
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // ── Programmatic layout ───────────────────────────────────────────────
        val root = android.widget.LinearLayout(this).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            gravity = android.view.Gravity.CENTER
            setBackgroundColor(android.graphics.Color.parseColor("#111118"))
            setPadding(80, 40, 80, 40)
        }

        val tvTitle = TextView(this).apply {
            text = "VGP Companion"
            textSize = 32f
            setTextColor(android.graphics.Color.WHITE)
            gravity = android.view.Gravity.CENTER
        }

        tvIp = TextView(this).apply {
            textSize = 22f
            setTextColor(android.graphics.Color.parseColor("#00d4aa"))
            gravity = android.view.Gravity.CENTER
            setPadding(0, 24, 0, 8)
        }

        val tvPort = TextView(this).apply {
            text = "Port: ${ControllerService.PORT}"
            textSize = 18f
            setTextColor(android.graphics.Color.parseColor("#888888"))
            gravity = android.view.Gravity.CENTER
        }

        tvStatus = TextView(this).apply {
            text = "Stopped"
            textSize = 20f
            setTextColor(android.graphics.Color.parseColor("#ff6b6b"))
            gravity = android.view.Gravity.CENTER
            setPadding(0, 24, 0, 24)
        }

        btnToggle = Button(this).apply {
            textSize = 18f
            setTextColor(android.graphics.Color.WHITE)
            setPadding(60, 20, 60, 20)
        }

        val tvHint = TextView(this).apply {
            text = "Enter this IP in the VirtualGamePad app on your phone"
            textSize = 14f
            setTextColor(android.graphics.Color.parseColor("#555566"))
            gravity = android.view.Gravity.CENTER
            setPadding(0, 32, 0, 0)
        }

        root.addView(tvTitle)
        root.addView(tvIp)
        root.addView(tvPort)
        root.addView(tvStatus)
        root.addView(btnToggle)
        root.addView(tvHint)
        setContentView(root)

        // Show IP
        tvIp.text = "IP: ${getLocalIp()}"

        // Button action
        btnToggle.setOnClickListener {
            val svc = service ?: return@setOnClickListener
            if (svc.isRunning) {
                sendServiceAction(ControllerService.ACTION_STOP)
            } else {
                sendServiceAction(ControllerService.ACTION_START)
            }
            // Update UI after a short delay so the service state settles
            btnToggle.postDelayed({ updateUi() }, 300)
        }
    }

    override fun onStart() {
        super.onStart()
        // Bind to service (start it if needed so it persists)
        val intent = Intent(this, ControllerService::class.java)
        startService(intent)
        bindService(intent, connection, Context.BIND_AUTO_CREATE)
    }

    override fun onStop() {
        super.onStop()
        if (bound) {
            unbindService(connection)
            bound = false
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private fun sendServiceAction(action: String) {
        startService(Intent(this, ControllerService::class.java).apply {
            this.action = action
        })
    }

    private fun updateUi() {
        val running = service?.isRunning ?: false
        if (running) {
            tvStatus.text = "Running ✓"
            tvStatus.setTextColor(android.graphics.Color.parseColor("#00d4aa"))
            btnToggle.text = "Stop Server"
            btnToggle.setBackgroundColor(android.graphics.Color.parseColor("#aa2222"))
        } else {
            tvStatus.text = "Stopped"
            tvStatus.setTextColor(android.graphics.Color.parseColor("#ff6b6b"))
            btnToggle.text = "Start Server"
            btnToggle.setBackgroundColor(android.graphics.Color.parseColor("#226622"))
        }
    }

    private fun getLocalIp(): String {
        return try {
            // NetworkInterface works on all Android versions including TV on Android 10+
            NetworkInterface.getNetworkInterfaces()
                .asSequence()
                .flatMap { iface -> iface.inetAddresses.asSequence()
                    .filter { addr ->
                        !addr.isLoopbackAddress &&
                        addr.hostAddress?.contains(':') == false // IPv4 only
                    }
                    .map { it.hostAddress ?: "" }
                }
                .firstOrNull { it.isNotEmpty() } ?: "unknown"
        } catch (_: Exception) {
            "unknown"
        }
    }
}
