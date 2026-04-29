package com.virtualgamepad.companion

import android.view.KeyEvent

/**
 * Maps gamepad button bits to Android KeyEvent keycodes.
 * Bit layout matches buttonMap.ts on the phone (Android HID Button 1-14 order):
 *
 *  Bit  Android Keycode
 *   0   KEYCODE_BUTTON_A      (A / Cross)
 *   1   KEYCODE_BUTTON_B      (B / Circle)
 *   2   KEYCODE_BUTTON_C      (N64 C▼ / spare)
 *   3   KEYCODE_BUTTON_X      (X / Square)
 *   4   KEYCODE_BUTTON_Y      (Y / Triangle)
 *   5   KEYCODE_BUTTON_Z      (N64 Z / Genesis Z)
 *   6   KEYCODE_BUTTON_L1     (L1 / LB)
 *   7   KEYCODE_BUTTON_R1     (R1 / RB)
 *   8   KEYCODE_BUTTON_L2     (L2 / LT / ZL)
 *   9   KEYCODE_BUTTON_R2     (R2 / RT / ZR)
 *  10   KEYCODE_BUTTON_SELECT (Select / −)
 *  11   KEYCODE_BUTTON_START  (Start / +)
 *  12   KEYCODE_BUTTON_THUMBL (L3)
 *  13   KEYCODE_BUTTON_THUMBR (R3)
 *  14   (unused)
 *  15   (unused)
 *
 *  D-Pad is sent as a hat value in the "dpad" message, not as button bits.
 */
object InputRelay {

    val BIT_TO_KEYCODE = intArrayOf(
        KeyEvent.KEYCODE_BUTTON_A,      //  0  A
        KeyEvent.KEYCODE_BUTTON_B,      //  1  B
        KeyEvent.KEYCODE_BUTTON_C,      //  2  C (N64 C▼)
        KeyEvent.KEYCODE_BUTTON_X,      //  3  X
        KeyEvent.KEYCODE_BUTTON_Y,      //  4  Y
        KeyEvent.KEYCODE_BUTTON_Z,      //  5  Z (N64 Z)
        KeyEvent.KEYCODE_BUTTON_L1,     //  6  L1
        KeyEvent.KEYCODE_BUTTON_R1,     //  7  R1
        KeyEvent.KEYCODE_BUTTON_L2,     //  8  L2
        KeyEvent.KEYCODE_BUTTON_R2,     //  9  R2
        KeyEvent.KEYCODE_BUTTON_SELECT, // 10  Select
        KeyEvent.KEYCODE_BUTTON_START,  // 11  Start
        KeyEvent.KEYCODE_BUTTON_THUMBL, // 12  L3
        KeyEvent.KEYCODE_BUTTON_THUMBR, // 13  R3
        KeyEvent.KEYCODE_UNKNOWN,       // 14  unused
        KeyEvent.KEYCODE_UNKNOWN,       // 15  unused
    )

    // D-Pad hat value → DPAD keycodes
    // Hat: 0=N,1=NE,2=E,3=SE,4=S,5=SW,6=W,7=NW, 8=neutral
    fun dispatchHat(hat: Int, pressed: Boolean) {
        val keys = when (hat) {
            0 -> listOf(KeyEvent.KEYCODE_DPAD_UP)
            1 -> listOf(KeyEvent.KEYCODE_DPAD_UP, KeyEvent.KEYCODE_DPAD_RIGHT)
            2 -> listOf(KeyEvent.KEYCODE_DPAD_RIGHT)
            3 -> listOf(KeyEvent.KEYCODE_DPAD_RIGHT, KeyEvent.KEYCODE_DPAD_DOWN)
            4 -> listOf(KeyEvent.KEYCODE_DPAD_DOWN)
            5 -> listOf(KeyEvent.KEYCODE_DPAD_DOWN, KeyEvent.KEYCODE_DPAD_LEFT)
            6 -> listOf(KeyEvent.KEYCODE_DPAD_LEFT)
            7 -> listOf(KeyEvent.KEYCODE_DPAD_LEFT, KeyEvent.KEYCODE_DPAD_UP)
            else -> emptyList() // neutral
        }
        keys.forEach { dispatchKey(it, pressed) }
    }

    fun dispatchKey(keycode: Int, pressed: Boolean) {
        if (keycode == KeyEvent.KEYCODE_UNKNOWN) return
        val action = if (pressed) "keydown" else "keyup"
        try {
            Runtime.getRuntime().exec(arrayOf("sh", "-c", "input keyevent $action $keycode"))
        } catch (_: Exception) {}
    }
}
