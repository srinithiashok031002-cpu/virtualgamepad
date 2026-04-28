/**
 * Maps every controller's button/dpad name to a standard 16-bit gamepad bitmask position.
 *
 * Bit layout (same as standard Xbox/DInput gamepad):
 *  0  A / Cross / N64-A / NES-A / Genesis-A
 *  1  B / Circle / N64-B / NES-B / Genesis-B
 *  2  X / Square / Genesis-X
 *  3  Y / Triangle / Genesis-Y
 *  4  L1 / LB / L / Genesis-Z
 *  5  R1 / RB / R
 *  6  Select / Share / Back / − / NES-Select / Saturn-L
 *  7  Start / Options / + / NES-Start / Saturn-R
 *  8  L2 / LT / ZL / N64-Z
 *  9  R2 / RT / ZR
 * 10  L3 (left stick click)
 * 11  R3 (right stick click)
 * 12  D-Pad UP    / C▲
 * 13  D-Pad DOWN  / C▼
 * 14  D-Pad LEFT  / C◀
 * 15  D-Pad RIGHT / C▶
 */

const BUTTON_MAP: Record<string, number> = {
  // ── Face buttons ──────────────────────────────────
  'A': 0, 'Cross': 0, '✕': 0,
  'B': 1, 'Circle': 1, '○': 1,
  'X': 2, 'Square': 2, '□': 2,
  'Y': 3, 'Triangle': 3, '△': 3,
  'C': 2,                           // Genesis C → X
  // ── Shoulders ─────────────────────────────────────
  'L': 4, 'L1': 4, 'LB': 4,
  'R': 5, 'R1': 5, 'RB': 5,
  'Z': 4, 'ZL': 8,                  // N64 Z → L2; JoyCon ZL → L2
  'ZR': 9,
  'L2': 8, 'LT': 8,
  'R2': 9, 'RT': 9,
  // ── Meta ──────────────────────────────────────────
  'Select': 6, 'Share': 6, '−': 6, 'BACK': 6,
  'Start': 7, 'Options': 7, '+': 7, 'START': 7,
  '⌂': 7, '⊡': 6,
  // ── Stick clicks ──────────────────────────────────
  'L3': 10, 'R3': 11,
  // ── D-Pad (names from DPad component) ─────────────
  'D-Pad UP': 12,    'UP': 12,
  'D-Pad DOWN': 13,  'DOWN': 13,
  'D-Pad LEFT': 14,  'LEFT': 14,
  'D-Pad RIGHT': 15, 'RIGHT': 15,
  // ── N64 C-buttons (mapped to D-Pad bits) ──────────
  'C▲': 12, 'C▼': 13, 'C◀': 14, 'C▶': 15,
  // ── Sega Saturn extra ─────────────────────────────
  'Saturn-L': 6, 'Saturn-R': 7,
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
