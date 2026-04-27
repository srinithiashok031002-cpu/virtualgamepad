/**
 * N64 Controller Layout
 *
 * Physical layout (landscape view of the 3-prong fork):
 *   [L]                            [R]
 *                                  [Z trigger — center-bottom]
 *   D-pad(left)  Analog(center)   C-Buttons(right cluster)
 *                [Start]           A(green large), B(blue small)
 *
 * Colors:
 *   - Body: gray
 *   - A: bright green, large circle
 *   - B: light blue, smaller circle
 *   - C-Up/Down/Left/Right: yellow rounded squares
 *   - L,R: gray shoulder bumpers
 *   - Z: dark gray long trigger
 *   - Start: red oval
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AnalogStick } from '../components/AnalogStick';
import { DPad } from '../components/DPad';
import { GameButton } from '../components/GameButton';
import { ShoulderButton } from '../components/ShoulderButton';
import { ControllerProps, StickPosition } from '../types';

export const N64Controller: React.FC<ControllerProps> = ({ onInput }) => {
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
      {/* Shoulder + Z row */}
      <View style={styles.shoulders}>
        <ShoulderButton label="L" color="#555" width={72} height={28} onPress={press} onRelease={release} />
        <View style={styles.zWrapper}>
          <ShoulderButton label="Z" color="#333" width={90} height={24} onPress={press} onRelease={release} />
        </View>
        <ShoulderButton label="R" color="#555" width={72} height={28} onPress={press} onRelease={release} />
      </View>

      {/* Main row */}
      <View style={styles.main}>
        {/* Left prong — D-Pad */}
        <View style={styles.prong}>
          <DPad size={116} onPress={dpadPress} onRelease={dpadRelease} />
        </View>

        {/* Center prong — Analog + Start */}
        <View style={styles.centerProng}>
          <AnalogStick
            label="Left Stick"
            size={96}
            onMove={stickMove}
          />
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
        </View>

        {/* Right prong — C-buttons + A + B */}
        <View style={styles.rightProng}>
          {/* C-buttons: 2x2 yellow grid */}
          <View style={styles.cButtonGrid}>
            <View style={styles.buttonRow}>
              <GameButton label="C▲" color="#f5c518" textColor="#1a1a1a" size={40} shape="rounded" fontSize={11} onPress={press} onRelease={release} />
              <View style={{ width: 40 }} />
            </View>
            <View style={styles.buttonRow}>
              <GameButton label="C◀" color="#f5c518" textColor="#1a1a1a" size={40} shape="rounded" fontSize={11} onPress={press} onRelease={release} />
              <GameButton label="C▶" color="#f5c518" textColor="#1a1a1a" size={40} shape="rounded" fontSize={11} onPress={press} onRelease={release} />
            </View>
            <View style={styles.buttonRow}>
              <View style={{ width: 40 }} />
              <GameButton label="C▼" color="#f5c518" textColor="#1a1a1a" size={40} shape="rounded" fontSize={11} onPress={press} onRelease={release} />
            </View>
          </View>

          {/* A + B */}
          <View style={styles.abCluster}>
            <GameButton
              label="B"
              color="#2980b9"
              size={42}
              shape="circle"
              fontSize={16}
              onPress={press}
              onRelease={release}
            />
            <GameButton
              label="A"
              color="#27ae60"
              size={54}
              shape="circle"
              fontSize={20}
              onPress={press}
              onRelease={release}
            />
          </View>
        </View>
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
  zWrapper: {
    alignItems: 'center',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
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
  cButtonGrid: {
    gap: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 4,
  },
  abCluster: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
});
