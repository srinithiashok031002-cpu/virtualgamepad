/**
 * Nintendo Switch Joy-Con Layout (attached / horizontal mode)
 *
 * Left Joy-Con:
 *   ZL (trigger top)
 *   L  (shoulder)
 *   Left Stick (top-center)
 *   D-Pad (bottom-center)
 *   Minus, Capture (meta row)
 *   SL, SR (side rails — shown as small)
 *
 * Right Joy-Con:
 *   ZR (trigger top)
 *   R  (shoulder)
 *   A(red), B(yellow), X(blue), Y(green) — diamond
 *   Right Stick (below A/B/X/Y)
 *   Plus, Home (meta row)
 *   SL, SR (side rails)
 *
 * Colors:
 *   - Left Joy-Con body: blue (#0ab9e6) — Switch neon blue
 *   - Right Joy-Con body: red (#e60012) — Switch neon red
 *   - A: red circle
 *   - B: yellow circle
 *   - X: blue circle
 *   - Y: green circle
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AnalogStick } from '../components/AnalogStick';
import { DPad } from '../components/DPad';
import { GameButton } from '../components/GameButton';
import { ShoulderButton } from '../components/ShoulderButton';
import { ControllerProps, StickPosition } from '../types';

const LEFT_COLOR = '#0ab9e6';
const RIGHT_COLOR = '#e60012';

export const JoyConController: React.FC<ControllerProps> = ({ onInput }) => {
  const press = (name: string) =>
    onInput({ controller: 'JOYCON', type: 'button', name, state: 'pressed' });
  const release = (name: string) =>
    onInput({ controller: 'JOYCON', type: 'button', name, state: 'released' });
  const dpadPress = (dir: string) =>
    onInput({ controller: 'JOYCON', type: 'dpad', name: `D-Pad ${dir}`, state: 'pressed' });
  const dpadRelease = (dir: string) =>
    onInput({ controller: 'JOYCON', type: 'dpad', name: `D-Pad ${dir}`, state: 'released' });
  const stickMove = (name: string, pos: StickPosition) =>
    onInput({ controller: 'JOYCON', type: 'stick', name, state: pos });

  return (
    <View style={styles.container}>
      {/* ===== LEFT JOY-CON ===== */}
      <View style={[styles.joycon, styles.leftJoyCon]}>
        {/* ZL + L shoulders */}
        <View style={styles.shoulderCol}>
          <ShoulderButton label="ZL" color={LEFT_COLOR} textColor="#fff" width={64} height={24} borderRadius={6} onPress={press} onRelease={release} />
          <ShoulderButton label="L" color={LEFT_COLOR} textColor="#fff" width={64} height={22} borderRadius={6} onPress={press} onRelease={release} />
        </View>

        {/* Main body */}
        <View style={styles.joyconBody}>
          {/* Left Stick */}
          <AnalogStick label="L Stick" size={90} onMove={stickMove} />

          {/* Meta row */}
          <View style={styles.metaRow}>
            <GameButton label="−" color="#1a1a2a" textColor="#aaa" size={30} shape="circle" fontSize={16} onPress={press} onRelease={release} />
            <GameButton label="⊡" color="#1a1a2a" textColor="#aaa" size={30} shape="circle" fontSize={14} onPress={press} onRelease={release} />
          </View>

          {/* D-Pad */}
          <DPad size={112} onPress={dpadPress} onRelease={dpadRelease} />
        </View>

        {/* Side rails */}
        <View style={styles.sideRail}>
          <ShoulderButton label="SL" color="#f0f0f0" textColor="#333" width={20} height={44} borderRadius={4} onPress={press} onRelease={release} />
          <ShoulderButton label="SR" color="#f0f0f0" textColor="#333" width={20} height={44} borderRadius={4} onPress={press} onRelease={release} />
        </View>
      </View>

      {/* Spacer */}
      <View style={styles.gap} />

      {/* ===== RIGHT JOY-CON ===== */}
      <View style={[styles.joycon, styles.rightJoyCon]}>
        {/* Side rails */}
        <View style={styles.sideRail}>
          <ShoulderButton label="SL" color="#f0f0f0" textColor="#333" width={20} height={44} borderRadius={4} onPress={press} onRelease={release} />
          <ShoulderButton label="SR" color="#f0f0f0" textColor="#333" width={20} height={44} borderRadius={4} onPress={press} onRelease={release} />
        </View>

        {/* Main body */}
        <View style={styles.joyconBody}>
          {/* ABXY Diamond */}
          <View style={styles.diamond}>
            {/* X top */}
            <View style={styles.diamondTop}>
              <GameButton label="X" color="#00a0e9" size={44} shape="circle" fontSize={16} onPress={press} onRelease={release} />
            </View>
            {/* Y left, A right */}
            <View style={styles.diamondMid}>
              <GameButton label="Y" color="#ffd400" textColor="#1a1a1a" size={44} shape="circle" fontSize={16} onPress={press} onRelease={release} />
              <View style={{ width: 8 }} />
              <GameButton label="A" color="#e60012" size={44} shape="circle" fontSize={16} onPress={press} onRelease={release} />
            </View>
            {/* B bottom */}
            <View style={styles.diamondBottom}>
              <GameButton label="B" color="#ffd400" textColor="#1a1a1a" size={44} shape="circle" fontSize={16} onPress={press} onRelease={release} />
            </View>
          </View>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <GameButton label="⌂" color="#1a1a2a" textColor="#aaa" size={30} shape="circle" fontSize={14} onPress={press} onRelease={release} />
            <GameButton label="+" color="#1a1a2a" textColor="#aaa" size={30} shape="circle" fontSize={16} onPress={press} onRelease={release} />
          </View>

          {/* Right Stick */}
          <AnalogStick label="R Stick" size={90} onMove={stickMove} />
        </View>

        {/* ZR + R shoulders */}
        <View style={styles.shoulderCol}>
          <ShoulderButton label="ZR" color={RIGHT_COLOR} textColor="#fff" width={64} height={24} borderRadius={6} onPress={press} onRelease={release} />
          <ShoulderButton label="R" color={RIGHT_COLOR} textColor="#fff" width={64} height={22} borderRadius={6} onPress={press} onRelease={release} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  joycon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 6,
    gap: 6,
  },
  leftJoyCon: {
    backgroundColor: 'rgba(10,185,230,0.12)',
    borderWidth: 1.5,
    borderColor: '#0ab9e6',
  },
  rightJoyCon: {
    backgroundColor: 'rgba(230,0,18,0.12)',
    borderWidth: 1.5,
    borderColor: '#e60012',
  },
  gap: {
    flex: 1,
  },
  joyconBody: {
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 10,
    flex: 1,
    paddingVertical: 4,
  },
  shoulderCol: {
    gap: 4,
    alignItems: 'center',
  },
  sideRail: {
    gap: 6,
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  diamond: {
    alignItems: 'center',
    gap: 2,
  },
  diamondTop: {
    alignItems: 'center',
  },
  diamondMid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diamondBottom: {
    alignItems: 'center',
  },
});
