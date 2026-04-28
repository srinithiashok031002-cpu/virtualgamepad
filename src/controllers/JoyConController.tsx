/**
 * Nintendo Switch Joy-Con Layout
 *
 * ZL / L and ZR / R are now a top bar spanning the full width,
 * matching how they appear on the physical JoyCons when held horizontally.
 *
 * Left Joy-Con body:  L Stick → Minus/Capture → D-Pad
 * Right Joy-Con body: ABXY diamond → Plus/Home → R Stick
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

const LEFT_COLOR = '#0ab9e6';
const RIGHT_COLOR = '#e60012';

export const JoyConController: React.FC<ControllerProps> = ({ onInput }) => {
  const { sensitivity } = useSettings();
  const sens = sensitivity / 100;

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
    <View style={styles.root}>

      {/* ══════════════════ TOP TRIGGER BAR ══════════════════ */}
      <View style={styles.triggerBar}>
        {/* Left triggers */}
        <DraggableGroup groupId="jc-left-triggers" label="ZL / L" style={styles.triggerGroup}>
          <ShoulderButton label="ZL" color={LEFT_COLOR} textColor="#fff" width={72} height={26} borderRadius={6} onPress={press} onRelease={release} />
          <ShoulderButton label="L"  color={LEFT_COLOR} textColor="#fff" width={72} height={24} borderRadius={6} onPress={press} onRelease={release} />
        </DraggableGroup>

        <View style={styles.triggerSpacer} />

        {/* Right triggers */}
        <DraggableGroup groupId="jc-right-triggers" label="ZR / R" style={styles.triggerGroup}>
          <ShoulderButton label="ZR" color={RIGHT_COLOR} textColor="#fff" width={72} height={26} borderRadius={6} onPress={press} onRelease={release} />
          <ShoulderButton label="R"  color={RIGHT_COLOR} textColor="#fff" width={72} height={24} borderRadius={6} onPress={press} onRelease={release} />
        </DraggableGroup>
      </View>

      {/* ══════════════════ JOYCON BODIES ══════════════════ */}
      <View style={styles.bodies}>

        {/* ───── LEFT JOY-CON ───── */}
        <View style={[styles.joycon, styles.leftJoyCon]}>
          {/* Side rails */}
          <View style={styles.sideRail}>
            <ShoulderButton label="SL" color="#f0f0f0" textColor="#333" width={20} height={44} borderRadius={4} onPress={press} onRelease={release} />
            <ShoulderButton label="SR" color="#f0f0f0" textColor="#333" width={20} height={44} borderRadius={4} onPress={press} onRelease={release} />
          </View>

          {/* Main body */}
          <View style={styles.joyconBody}>
            <DraggableGroup groupId="jc-lstick" label="L Stick">
              <AnalogStick label="L Stick" size={90} sensitivity={sens} onMove={stickMove} />
            </DraggableGroup>

            <View style={styles.metaRow}>
              <GameButton label="−" color="#1a1a2a" textColor="#aaa" size={30} shape="circle" fontSize={16} onPress={press} onRelease={release} />
              <GameButton label="⊡" color="#1a1a2a" textColor="#aaa" size={30} shape="circle" fontSize={14} onPress={press} onRelease={release} />
            </View>

            <DraggableGroup groupId="jc-dpad" label="D-Pad">
              <DPad size={112} onPress={dpadPress} onRelease={dpadRelease} />
            </DraggableGroup>
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.gap} />

        {/* ───── RIGHT JOY-CON ───── */}
        <View style={[styles.joycon, styles.rightJoyCon]}>
          {/* Main body */}
          <View style={styles.joyconBody}>
            {/* ABXY Diamond */}
            <DraggableGroup groupId="jc-abxy" label="ABXY">
              <View style={styles.diamond}>
                <View style={styles.diamondTop}>
                  <GameButton label="X" color="#00a0e9" size={44} shape="circle" fontSize={16} onPress={press} onRelease={release} />
                </View>
                <View style={styles.diamondMid}>
                  <GameButton label="Y" color="#ffd400" textColor="#1a1a1a" size={44} shape="circle" fontSize={16} onPress={press} onRelease={release} />
                  <View style={{ width: 8 }} />
                  <GameButton label="A" color="#e60012" size={44} shape="circle" fontSize={16} onPress={press} onRelease={release} />
                </View>
                <View style={styles.diamondBottom}>
                  <GameButton label="B" color="#ffd400" textColor="#1a1a1a" size={44} shape="circle" fontSize={16} onPress={press} onRelease={release} />
                </View>
              </View>
            </DraggableGroup>

            <View style={styles.metaRow}>
              <GameButton label="⌂" color="#1a1a2a" textColor="#aaa" size={30} shape="circle" fontSize={14} onPress={press} onRelease={release} />
              <GameButton label="+" color="#1a1a2a" textColor="#aaa" size={30} shape="circle" fontSize={16} onPress={press} onRelease={release} />
            </View>

            <DraggableGroup groupId="jc-rstick" label="R Stick">
              <AnalogStick label="R Stick" size={90} sensitivity={sens} onMove={stickMove} />
            </DraggableGroup>
          </View>

          {/* Side rails */}
          <View style={styles.sideRail}>
            <ShoulderButton label="SL" color="#f0f0f0" textColor="#333" width={20} height={44} borderRadius={4} onPress={press} onRelease={release} />
            <ShoulderButton label="SR" color="#f0f0f0" textColor="#333" width={20} height={44} borderRadius={4} onPress={press} onRelease={release} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
  },
  // ── Trigger bar ──
  triggerBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 2,
  },
  triggerGroup: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  triggerSpacer: {
    flex: 1,
  },
  // ── Bodies ──
  bodies: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 8,
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
