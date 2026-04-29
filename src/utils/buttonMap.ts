/**
 * Maps every controller button name → bit position in a 16-bit bitmask,
 * aligned to Android's HID Button 1-14 keycode mapping:
 *
 *  Bit  HID Btn  Android Keycode     Used for
 *   0      1     BUTTON_A            A / Cross / N64-A / NES-A
 *   1      2     BUTTON_B            B / Circle / N64-B / NES-B
 *   2      3     BUTTON_C            N64 C▼ / spare
 *   3      4     BUTTON_X            X / Square / N64 C▶ / Genesis-C
 *   4      5     BUTTON_Y            Y / Triangle / N64 C▲ / Genesis-Y
 *   5      6     BUTTON_Z            N64 Z / Genesis-Z
 *   6      7     BUTTON_L1           L / L1 / LB
 *   7      8     BUTTON_R1           R / R1 / RB
 *   8      9     BUTTON_L2           L2 / LT / ZL
 *   9     10     BUTTON_R2           R2 / RT / ZR
 *  10     11     BUTTON_SELECT       Select / − / Share / Back
 *  11     12     BUTTON_START        Start / + / Options
 *  12     13     BUTTON_THUMBL       L3
 *  13     14     BUTTON_THUMBR       R3
 *  14-15   —     (unused)
 *
 * D-Pad directions are NOT in the button bitmask.
 * They are sent as a HID Hat Switch byte — use computeHatValue().
 */

const BUTTON_MAP: Record<string, number> = {
  // ── Face buttons ──────────────────────────────────────────────────────────
  'A': 0, 'Cross': 0, '✕': 0,
  'B': 1, 'Circle': 1, '○': 1,
  // Bit 2 = BUTTON_C (Android legacy slot)
  'C': 2,                              // N64 C▼ / Genesis spare
  // Bit 3 = BUTTON_X
  'X': 3, 'Square': 3, '□': 3,
  // Bit 4 = BUTTON_Y
  'Y': 4, 'Triangle': 4, '△': 4,
  // Bit 5 = BUTTON_Z
  'Z': 5,                              // N64 Z / Genesis Z (distinct from C-buttons)
  'ZL': 8,                             // JoyCon ZL → L2
  'ZR': 9,                             // JoyCon ZR → R2
  // ── Shoulders ─────────────────────────────────────────────────────────────
  'L': 6, 'L1': 6, 'LB': 6,
  'R': 7, 'R1': 7, 'RB': 7,
  'L2': 8, 'LT': 8,
  'R2': 9, 'RT': 9,
  // ── Meta ──────────────────────────────────────────────────────────────────
  'Select': 10, 'Share': 10, '−': 10, 'BACK': 10, '⊡': 10,
  'Start': 11, 'Options': 11, '+': 11, 'START': 11, '⌂': 11,
  // ── Stick clicks ──────────────────────────────────────────────────────────
  'L3': 12, 'R3': 13,
  // ── Sega Saturn extra ─────────────────────────────────────────────────────
  'Saturn-L': 10, 'Saturn-R': 11,
  // NOTE: N64 C-buttons (C▲ C▼ C◀ C▶) are NOT in this map.
  // They are routed to the right analog stick axes in sendEvent so that
  // M64Plus FZ (and other N64 emulators) auto-detect them as C-buttons.
};

/** Returns the bit position (0-15) for a button name, or -1 if unknown. */
export function getButtonBit(name: string): number {
  if (name in BUTTON_MAP) return BUTTON_MAP[name];
  // Case-insensitive fallback
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(BUTTON_MAP)) {
    if (k.toLowerCase() === lower) return v;
  }
  return -1;
}

// ── D-Pad Hat Switch ──────────────────────────────────────────────────────────

export interface DpadState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

/**
 * Converts a D-Pad state into a HID Hat Switch value.
 * Values 0-7 map to compass directions (N, NE, E, SE, S, SW, W, NW).
 * Value 8 = neutral (sent as out-of-range, triggers the Null State flag).
 */
export function computeHatValue(dpad: DpadState): number {
  const { up, down, left, right } = dpad;
  if (up    && right) return 1; // NE
  if (right && down)  return 3; // SE
  if (down  && left)  return 5; // SW
  if (left  && up)    return 7; // NW
  if (up)    return 0; // N
  if (right) return 2; // E
  if (down)  return 4; // S
  if (left)  return 6; // W
  return 8;            // neutral
}

/** D-Pad button names that should be routed to the hat, not the bitmask. */
export const DPAD_NAMES = new Set([
  'D-Pad UP', 'UP',
  'D-Pad DOWN', 'DOWN',
  'D-Pad LEFT', 'LEFT',
  'D-Pad RIGHT', 'RIGHT',
]);

// ── N64 C-Button → Right Stick Axis mapping ───────────────────────────────────
// Android has no "C-Left" keycode. Routing C-buttons through the right analog
// stick axes is the standard approach — M64Plus FZ auto-detects them correctly.

export interface CButtonAxis {
  axis: 'rx' | 'ry';
  direction: 1 | -1;   // +1 = positive axis, -1 = negative axis
}

export const CBUTTON_AXES: Record<string, CButtonAxis> = {
  'C▲': { axis: 'ry', direction: -1 },  // right stick up
  'C▼': { axis: 'ry', direction:  1 },  // right stick down
  'C◀': { axis: 'rx', direction: -1 },  // right stick left
  'C▶': { axis: 'rx', direction:  1 },  // right stick right
};

export const CBUTTON_NAMES = new Set(Object.keys(CBUTTON_AXES));
