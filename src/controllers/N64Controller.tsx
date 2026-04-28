/**
 * N64 Controller Layout
 *
 * Physical layout (landscape):
 *   [L]                            [R]
 *   D-pad(left)  Analog(center)   C-Buttons(right) — diamond cross
 *                [Start]           A(green), B(blue)
 *                [Z — bottom]
 *
 * Z trigger moved to bottom-center per real N64 physical layout.
 * C buttons arranged as a proper +/cross: ▲ top, ◀ left, ▶ right, ▼ bottom.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { AnalogStick } from '../components/AnalogStick';
import { DPad } from '../components/DPad';
import { DraggableGroup } from '../components/DraggableGroup';
import { GameButton } from '../components/GameButton';
import { ShoulderButton } from '../components/ShoulderButton';
import { ControllerProps, StickPosition } from '../types';

export const N64Controller: React.FC<ControllerProps> = ({ onInput }) => {
  const { sensitivity } = useSettings();
  const sens = sensitivity / 100;

  const press = (name: string) =>
    onInput({ controller: 'N64', type: 'button', name, state: 'pressed' });
  const release = (name: string) =>
    onInput({ controller: 'N64', type: 'button', name, state: 'released' });
  const dpadPress = (dir: string) =>
    onInput({ controller: 'N64', type: 'dpad', name: `D-Pad ${dir}`, state: 'pressed' });
  const dpadRelease = (dir: string) =>
    onInput({ controller: 'N64', type: 'dpad', name: `D-Pad ${dir}`, state: 'released' });
  const stickMove = (name: string, pos: StickPosition) =>
    onInput({ controller: 'N64', type: 'stick', name, state: pos });

  return (
    <View style={styles.outer}>
      {/* ── L / R shoulder row (top) ── */}
      <View style={styles.shoulders}>
        <DraggableGroup groupId="n64-L" label="L">
          <ShoulderButton label="L" color="#555" width={72} height={28} onPress={press} onRelease={release} />
        </DraggableGroup>
        <DraggableGroup groupId="n64-R" label="R">
          <ShoulderButton label="R" color="#555" width={72} height={28} onPress={press} onRelease={release} />
        </DraggableGroup>
      </View>

      {/* ── Main body row ── */}
      <View style={styles.main}>
        {/* Left prong — D-Pad */}
        <DraggableGroup groupId="n64-dpad" label="D-Pad" style={styles.prong}>
          <DPad size={116} onPress={dpadPress} onRelease={dpadRelease} />
        </DraggableGroup>

        {/* Center prong — Analog + Start */}
        <DraggableGroup groupId="n64-center" label="Center" style={styles.centerProng}>
          <AnalogStick label="Left Stick" size={96} sensitivity={sens} onMove={stickMove} />
          <GameButton
            label="START"
            color="#c0392b"
            textColor="#fff"
            shape="rounded"
            width={58}
            height={24}
            fontSize={10}
            onPress={press}
            onRelease={release}
          />
        </DraggableGroup>

        {/* Right prong — C-buttons cross + A + B */}
        <DraggableGroup groupId="n64-right" label="Buttons" style={styles.rightProng}>
          {/* C-buttons: proper +/cross pattern */}
          <View style={styles.cCross}>
            {/* Top */}
            <View style={styles.cRow}>
              <View style={styles.cSpacer} />
              <GameButton label="C▲" color="#f5c518" textColor="#1a1a1a" size={40} shape="rounded" fontSize={11} onPress={press} onRelease={release} />
              <View style={styles.cSpacer} />
            </View>
            {/* Middle */}
            <View style={styles.cRow}>
              <GameButton label="C◀" color="#f5c518" textColor="#1a1a1a" size={40} shape="rounded" fontSize={11} onPress={press} onRelease={release} />
              <View style={styles.cCenter} />
              <GameButton label="C▶" color="#f5c518" textColor="#1a1a1a" size={40} shape="rounded" fontSize={11} onPress={press} onRelease={release} />
            </View>
            {/* Bottom */}
            <View style={styles.cRow}>
              <View style={styles.cSpacer} />
              <GameButton label="C▼" color="#f5c518" textColor="#1a1a1a" size={40} shape="rounded" fontSize={11} onPress={press} onRelease={release} />
              <View style={styles.cSpacer} />
            </View>
          </View>

          {/* A + B */}
          <View style={styles.abCluster}>
            <GameButton label="B" color="#2980b9" size={42} shape="circle" fontSize={16} onPress={press} onRelease={release} />
            <GameButton label="A" color="#27ae60" size={54} shape="circle" fontSize={20} onPress={press} onRelease={release} />
          </View>
        </DraggableGroup>
      </View>

      {/* ── Z trigger — bottom center ── */}
      <View style={styles.zRow}>
        <DraggableGroup groupId="n64-Z" label="Z">
          <ShoulderButton label="Z" color="#333" width={110} height={28} onPress={press} onRelease={release} />
        </DraggableGroup>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    flexDirection: 'column',
  },
  shoulders: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  prong: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerProng: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  rightProng: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  // C-button cross
  cCross: {
    gap: 4,
    alignItems: 'center',
  },
  cRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cSpacer: {
    width: 40,
    height: 40,
  },
  cCenter: {
    width: 20,
    height: 40,
  },
  abCluster: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  zRow: {
    alignItems: 'center',
    paddingBottom: 8,
  },
});
