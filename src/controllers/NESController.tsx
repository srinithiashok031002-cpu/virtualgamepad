/**
 * NES Controller Layout
 *
 * Physical layout:
 *   [SELECT] [START]   <-- center meta buttons (rectangular, dark gray)
 *   D-pad left          A B right  (A=red circle, B=red circle, smaller)
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DPad } from '../components/DPad';
import { GameButton } from '../components/GameButton';
import { ControllerProps } from '../types';

export const NESController: React.FC<ControllerProps> = ({ onInput }) => {
  const press = (name: string) =>
    onInput({ controller: 'NES', type: 'button', name, state: 'pressed' });
  const release = (name: string) =>
    onInput({ controller: 'NES', type: 'button', name, state: 'released' });
  const dpadPress = (dir: string) =>
    onInput({ controller: 'NES', type: 'dpad', name: `D-Pad ${dir}`, state: 'pressed' });
  const dpadRelease = (dir: string) =>
    onInput({ controller: 'NES', type: 'dpad', name: `D-Pad ${dir}`, state: 'released' });

  return (
    <View style={styles.container}>
      {/* Left — D-Pad */}
      <View style={styles.leftSide}>
        <DPad size={128} onPress={dpadPress} onRelease={dpadRelease} />
      </View>

      {/* Center — Select + Start */}
      <View style={styles.center}>
        <View style={styles.metaRow}>
          <GameButton
            label="SELECT"
            color="#444"
            textColor="#bbb"
            shape="rounded"
            width={62}
            height={22}
            fontSize={9}
            onPress={press}
            onRelease={release}
          />
          <GameButton
            label="START"
            color="#444"
            textColor="#bbb"
            shape="rounded"
            width={62}
            height={22}
            fontSize={9}
            onPress={press}
            onRelease={release}
          />
        </View>
      </View>

      {/* Right — B + A */}
      <View style={styles.rightSide}>
        <View style={styles.abRow}>
          {/* B is left, A is right; both circular red, A slightly larger */}
          <GameButton
            label="B"
            color="#c0392b"
            size={50}
            shape="circle"
            fontSize={16}
            onPress={press}
            onRelease={release}
          />
          <GameButton
            label="A"
            color="#c0392b"
            size={58}
            shape="circle"
            fontSize={18}
            onPress={press}
            onRelease={release}
          />
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
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  rightSide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  abRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
  },
});
