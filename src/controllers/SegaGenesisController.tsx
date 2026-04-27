/**
 * Sega Genesis 6-Button Controller Layout
 *
 * Physical layout:
 *   D-pad (left)   [MODE] [START]   X Y Z (top row)
 *                                   A B C (bottom row)
 *
 * Colors: all black/dark buttons on dark body
 *   - A,B,C: black with gray label
 *   - X,Y,Z: black with gray label
 *   - Start: black oval
 *   - Mode: black oval, smaller
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DPad } from '../components/DPad';
import { GameButton } from '../components/GameButton';
import { ControllerProps } from '../types';

export const SegaGenesisController: React.FC<ControllerProps> = ({ onInput }) => {
  const press = (name: string) =>
    onInput({ controller: 'SEGA_GENESIS', type: 'button', name, state: 'pressed' });
  const release = (name: string) =>
    onInput({ controller: 'SEGA_GENESIS', type: 'button', name, state: 'released' });
  const dpadPress = (dir: string) =>
    onInput({ controller: 'SEGA_GENESIS', type: 'dpad', name: `D-Pad ${dir}`, state: 'pressed' });
  const dpadRelease = (dir: string) =>
    onInput({ controller: 'SEGA_GENESIS', type: 'dpad', name: `D-Pad ${dir}`, state: 'released' });

  return (
    <View style={styles.container}>
      {/* Left — D-Pad */}
      <View style={styles.leftSide}>
        <DPad size={128} onPress={dpadPress} onRelease={dpadRelease} />
      </View>

      {/* Center — Mode + Start */}
      <View style={styles.center}>
        <View style={styles.metaRow}>
          <GameButton
            label="MODE"
            color="#222"
            textColor="#888"
            shape="rounded"
            width={52}
            height={22}
            fontSize={9}
            onPress={press}
            onRelease={release}
          />
          <GameButton
            label="START"
            color="#222"
            textColor="#888"
            shape="rounded"
            width={62}
            height={26}
            fontSize={10}
            onPress={press}
            onRelease={release}
          />
        </View>
      </View>

      {/* Right — 6 action buttons */}
      <View style={styles.rightSide}>
        {/* Top row: X Y Z */}
        <View style={styles.buttonRow}>
          {['X', 'Y', 'Z'].map(btn => (
            <GameButton
              key={btn}
              label={btn}
              color="#1a1a2a"
              textColor="#bbb"
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
          {['A', 'B', 'C'].map(btn => (
            <GameButton
              key={btn}
              label={btn}
              color="#1a1a2a"
              textColor="#bbb"
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
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
  metaRow: {
    flexDirection: 'row',
    gap: 14,
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
