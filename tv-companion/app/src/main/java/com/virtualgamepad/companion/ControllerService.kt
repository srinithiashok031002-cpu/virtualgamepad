package com.virtualgamepad.companion

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

/**
 * Foreground service that keeps the WebSocket server alive even when the
 * TV launcher pushes MainActivity to the background.
 */
class ControllerService : Service() {

    inner class LocalBinder : Binder() {
        fun getService(): ControllerService = this@ControllerService
    }

    private val binder = LocalBinder()
    private var server: ControllerServer? = null
    var isRunning = false
        private set

    companion object {
        private const val CHANNEL_ID  = "vgp_server"
        private const val NOTIF_ID    = 1
        const val ACTION_START = "vgp.START"
        const val ACTION_STOP  = "vgp.STOP"
        const val PORT = 8765
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> startServer()
            ACTION_STOP  -> { stopServer(); stopSelf() }
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent): IBinder = binder

    override fun onDestroy() {
        stopServer()
        super.onDestroy()
    }

    // ─── Server lifecycle ─────────────────────────────────────────────────────

    fun startServer() {
        if (isRunning) return
        server = ControllerServer(PORT).apply { start() }
        isRunning = true
        startForeground(NOTIF_ID, buildNotification("Server running on port $PORT"))
    }

    fun stopServer() {
        try { server?.stop(500) } catch (_: Exception) {}
        server = null
        isRunning = false
        stopForeground(STOP_FOREGROUND_REMOVE)
    }

    // ─── Notification ─────────────────────────────────────────────────────────

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val chan = NotificationChannel(
                CHANNEL_ID,
                "VGP Companion Server",
                NotificationManager.IMPORTANCE_LOW
            ).apply { description = "Keeps the virtual gamepad server active" }
            getSystemService(NotificationManager::class.java)
                .createNotificationChannel(chan)
        }
    }

    private fun buildNotification(text: String): Notification {
        val openIntent = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )
        val stopIntent = PendingIntent.getService(
            this, 1,
            Intent(this, ControllerService::class.java).apply { action = ACTION_STOP },
            PendingIntent.FLAG_IMMUTABLE
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setContentTitle("VGP Companion")
            .setContentText(text)
            .setContentIntent(openIntent)
            .addAction(android.R.drawable.ic_delete, "Stop", stopIntent)
            .setOngoing(true)
            .build()
    }
}
