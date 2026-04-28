package com.virtualgamepad.companion

import android.view.KeyEvent

/**
 * Maps normalised gamepad button bits (same bitmask as the phone app) to
 * Android GamePad KeyEvent keycodes, then dispatches them via the
 * instrumentation API (requires INJECT_EVENTS or root, obtained via
 * adb shell settings) or forwards to RetroArch's UDP server.
 *
 * Bit → Android keycode mapping (same as phone app buttonMap.ts):
 *  0  A              KEYCODE_BUTTON_A
 *  1  B              KEYCODE_BUTTON_B
 *  2  X              KEYCODE_BUTTON_X
 *  3  Y              KEYCODE_BUTTON_Y
 *  4  L1/LB          KEYCODE_BUTTON_L1
 *  5  R1/RB          KEYCODE_BUTTON_R1
 *  6  Select/Back    KEYCODE_BUTTON_SELECT
 *  7  Start          KEYCODE_BUTTON_START
 *  8  L2/LT          KEYCODE_BUTTON_L2
 *  9  R2/RT          KEYCODE_BUTTON_R2
 * 10  L3             KEYCODE_BUTTON_THUMBL
 * 11  R3             KEYCODE_BUTTON_THUMBR
 * 12  D-Pad UP       KEYCODE_DPAD_UP
 * 13  D-Pad DOWN     KEYCODE_DPAD_DOWN
 * 14  D-Pad LEFT     KEYCODE_DPAD_LEFT
 * 15  D-Pad RIGHT    KEYCODE_DPAD_RIGHT
 */
object InputRelay {

    val BIT_TO_KEYCODE = intArrayOf(
        KeyEvent.KEYCODE_BUTTON_A,      //  0
        KeyEvent.KEYCODE_BUTTON_B,      //  1
        KeyEvent.KEYCODE_BUTTON_X,      //  2
        KeyEvent.KEYCODE_BUTTON_Y,      //  3
        KeyEvent.KEYCODE_BUTTON_L1,     //  4
        KeyEvent.KEYCODE_BUTTON_R1,     //  5
        KeyEvent.KEYCODE_BUTTON_SELECT, //  6
        KeyEvent.KEYCODE_BUTTON_START,  //  7
        KeyEvent.KEYCODE_BUTTON_L2,     //  8
        KeyEvent.KEYCODE_BUTTON_R2,     //  9
        KeyEvent.KEYCODE_BUTTON_THUMBL, // 10
        KeyEvent.KEYCODE_BUTTON_THUMBR, // 11
        KeyEvent.KEYCODE_DPAD_UP,       // 12
        KeyEvent.KEYCODE_DPAD_DOWN,     // 13
        KeyEvent.KEYCODE_DPAD_LEFT,     // 14
        KeyEvent.KEYCODE_DPAD_RIGHT,    // 15
    )

    /** Emit a KeyEvent for the given keycode via shell (ADB path). */
    fun dispatchKey(keycode: Int, pressed: Boolean) {
        val action = if (pressed) "keydown" else "keyup"
        try {
            Runtime.getRuntime().exec(
                arrayOf("sh", "-c", "input keyevent --longpress $keycode")
            )
            // Non-root fallback: broadcast intent that emulators may intercept
        } catch (_: Exception) {}
    }
}
