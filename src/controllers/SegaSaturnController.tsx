/**
 * Sega Saturn Controller Layout
 *
 * Physical layout (landscape):
 *   [L]                              [R]
 *   D-pad (left)  [Start]   X Y Z (top)
 *                            A B C (bottom)
 *
 * Colors:
 *   - Body: gray
 *   - A: yellow circle
 *   - B: yellow circle
 *   - C: yellow circle
 *   - X: blue circle (on actual Saturn pad it's similar)
 *   - Y: blue circle
 *   - Z: blue circle
 *   - Start: black oval
 *   - L, R: gray shoulder bumpers
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DPad } from '../components/DPad';
import { GameButton } from '../components/GameButton';
import { ShoulderButton } from '../components/ShoulderButton';
import { ControllerProps } from '../types';

export const SegaSaturnController: React.FC<ControllerProps> = ({ onInput }) => {
  const press = (name: string) =>
    onInput({ controller: 'SEGA_SATURN', type: 'button', name, state: 'pressed' });
  const release = (name: string) =>
    onInput({ controller: 'SEGA_SATURN', type: 'button', name, state: 'released' });
  const dpadPress = (dir: string) =>
    onInput({ controller: 'SEGA_SATURN', type: 'dpad', name: `D-Pad ${dir}`, state: 'pressed' });
  const dpadRelease = (dir: string) =>
    onInput({ controller: 'SEGA_SATURN', type: 'dpad', name: `D-Pad ${dir}`, state: 'released' });

  return (
    <View style={styles.outer}>
      {/* Shoulder row */}
      <View style={styles.shoulders}>
        <ShoulderButton label="L" color="#555" width={72} height={28} onPress={press} onRelease={release} />
        <View style={{ flex: 1 }} />
        <ShoulderButton label="R" color="#555" width={72} height={28} onPress={press} onRelease={release} />
      </View>

      {/* Main row */}
      <View style={styles.main}>
        {/* Left — D-Pad */}
        <View style={styles.leftSide}>
          <DPad size={128} onPress={dpadPress} onRelease={dpadRelease} />
        </View>

        {/* Center — Start */}
        <View style={styles.center}>
          <GameButton
            label="START"
            color="#222"
            textColor="#aaa"
            shape="rounded"
            width={64}
            height={26}
            fontSize={10}
            onPress={press}
            onRelease={release}
          />
        </View>

        {/* Right — 6 action buttons */}
        <View style={styles.rightSide}>
          {/* Top row: X Y Z */}
          <View style={styles.buttonRow}>
            {[
              { label: 'X', color: '#1565c0' },
              { label: 'Y', color: '#1565c0' },
              { label: 'Z', color: '#1565c0' },
            ].map(btn => (
              <GameButton
                key={btn.label}
                label={btn.label}
                color={btn.color}
                textColor="#fff"
                size={46}
                shape="circle"
                fontSize={15}
                onPress={press}
                onRelease={release}
              />
            ))}
          </View>
          {/* Bottom row: A B C */}
          <View style={styles.buttonRow}>
            {[
              { label: 'A', color: '#d4a017' },
              { label: 'B', color: '#d4a017' },
              { label: 'C', color: '#d4a017' },
            ].map(btn => (
              <GameButton
                key={btn.label}
                label={btn.label}
                color={btn.color}
                textColor="#1a1a1a"
                size={46}
                shape="circle"
                fontSize={15}
                onPress={press}
                onRelease={release}
              />
            ))}
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
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  leftSide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSide: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
