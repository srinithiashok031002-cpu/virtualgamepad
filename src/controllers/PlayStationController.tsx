/**
 * PlayStation DualShock / DualSense Controller Layout
 *
 * Physical layout (landscape):
 *   [L2]                              [R2]
 *   [L1]                              [R1]
 *   D-Pad (top-left)    □△ (top-right)
 *   L3 Stick (bottom-left)    ✕○ (bottom-right)
 *                              R3 Stick
 *   [SELECT/SHARE]  [PS]  [OPTIONS/START]  (center)
 *   [TOUCHPAD] (center)
 *
 * Colors (authentic):
 *   - △ Triangle: #00b185 (teal/green)
 *   - ○ Circle:   #e8003d (red/pink)
 *   - ✕ Cross:    #003791 (blue)
 *   - □ Square:   #e8003d → actually #d03dac (pink/magenta)
 *   - L1,L2,R1,R2: dark gray
 *   - PS button: silver/gray
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AnalogStick } from '../components/AnalogStick';
import { DPad } from '../components/DPad';
import { GameButton } from '../components/GameButton';
import { ShoulderButton } from '../components/ShoulderButton';
import { ControllerProps, StickPosition } from '../types';

export const PlayStationController: React.FC<ControllerProps> = ({ onInput }) => {
  const press = (name: string) =>
    onInput({ controller: 'PLAYSTATION', type: 'button', name, state: 'pressed' });
  const release = (name: string) =>
    onInput({ controller: 'PLAYSTATION', type: 'button', name, state: 'released' });
  const dpadPress = (dir: string) =>
    onInput({ controller: 'PLAYSTATION', type: 'dpad', name: `D-Pad ${dir}`, state: 'pressed' });
  const dpadRelease = (dir: string) =>
    onInput({ controller: 'PLAYSTATION', type: 'dpad', name: `D-Pad ${dir}`, state: 'released' });
  const stickMove = (name: string, pos: StickPosition) =>
    onInput({ controller: 'PLAYSTATION', type: 'stick', name, state: pos });

  return (
    <View style={styles.outer}>
      {/* ===== Shoulder row ===== */}
      <View style={styles.shoulders}>
        <View style={styles.shoulderGroup}>
          <ShoulderButton label="L2" color="#2a2a3a" width={68} height={26} onPress={press} onRelease={release} />
          <ShoulderButton label="L1" color="#3a3a4a" width={68} height={24} onPress={press} onRelease={release} />
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.shoulderGroup}>
          <ShoulderButton label="R2" color="#2a2a3a" width={68} height={26} onPress={press} onRelease={release} />
          <ShoulderButton label="R1" color="#3a3a4a" width={68} height={24} onPress={press} onRelease={release} />
        </View>
      </View>

      {/* ===== Main body ===== */}
      <View style={styles.main}>
        {/* ---- Left cluster ---- */}
        <View style={styles.leftCluster}>
          {/* D-Pad top */}
          <DPad size={110} onPress={dpadPress} onRelease={dpadRelease} />
          {/* L3 Analog bottom */}
          <AnalogStick label="L3" size={86} onMove={stickMove} />
        </View>

        {/* ---- Center meta ---- */}
        <View style={styles.centerCluster}>
          <GameButton
            label="SHARE"
            color="#222"
            textColor="#777"
            shape="rounded"
            width={56}
            height={22}
            fontSize={9}
            onPress={press}
            onRelease={release}
          />
          {/* Touchpad */}
          <GameButton
            label="TOUCH\nPAD"
            color="#2a2a3a"
            textColor="#555"
            shape="rounded"
            width={70}
            height={42}
            fontSize={9}
            onPress={press}
            onRelease={release}
          />
          {/* PS button */}
          <GameButton
            label="PS"
            color="#aaa"
            textColor="#1a1a1a"
            size={36}
            shape="circle"
            fontSize={11}
            onPress={press}
            onRelease={release}
          />
          <GameButton
            label="OPTIONS"
            color="#222"
            textColor="#777"
            shape="rounded"
            width={56}
            height={22}
            fontSize={9}
            onPress={press}
            onRelease={release}
          />
        </View>

        {/* ---- Right cluster ---- */}
        <View style={styles.rightCluster}>
          {/* △○□✕ diamond */}
          <View style={styles.diamond}>
            {/* △ top */}
            <View style={styles.dRow}>
              <GameButton label="△" color="#00b185" size={46} shape="circle" fontSize={18} onPress={press} onRelease={release} />
            </View>
            {/* □ left, ○ right */}
            <View style={styles.dMidRow}>
              <GameButton label="□" color="#d03dac" size={46} shape="circle" fontSize={18} onPress={press} onRelease={release} />
              <View style={{ width: 6 }} />
              <GameButton label="○" color="#e8003d" size={46} shape="circle" fontSize={18} onPress={press} onRelease={release} />
            </View>
            {/* ✕ bottom */}
            <View style={styles.dRow}>
              <GameButton label="✕" color="#003791" size={46} shape="circle" fontSize={18} onPress={press} onRelease={release} />
            </View>
          </View>

          {/* R3 Analog */}
          <AnalogStick label="R3" size={86} onMove={stickMove} />
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
    gap: 6,
  },
  shoulderGroup: {
    gap: 4,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  leftCluster: {
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 10,
    flex: 0,
  },
  centerCluster: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rightCluster: {
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 10,
    flex: 0,
  },
  diamond: {
    alignItems: 'center',
    gap: 2,
  },
  dRow: {
    alignItems: 'center',
  },
  dMidRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
