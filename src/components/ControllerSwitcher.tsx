import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useConnection } from '../context/ConnectionContext';
import { SettingsPanel } from './SettingsPanel';
import { ConnectionPanel } from './ConnectionPanel';
import { CONTROLLER_LABELS, ControllerType } from '../types';

const CONTROLLERS: ControllerType[] = [
  'NES',
  'SEGA_GENESIS',
  'SEGA_SATURN',
  'N64',
  'JOYCON',
  'PLAYSTATION',
];

const ACCENT_COLORS: Record<ControllerType, string> = {
  NES: '#e63946',
  SEGA_GENESIS: '#0077b6',
  SEGA_SATURN: '#2d6a4f',
  N64: '#9d4edd',
  JOYCON: '#e63946',
  PLAYSTATION: '#003566',
};

interface ControllerSwitcherProps {
  current: ControllerType;
  onChange: (controller: ControllerType) => void;
}

// Status dot colour per connection status
const STATUS_COLOR: Record<string, string> = {
  connected:    '#00d4aa',
  connecting:   '#f4a261',
  error:        '#e63946',
  disconnected: '#444',
};

export const ControllerSwitcher: React.FC<ControllerSwitcherProps> = ({
  current,
  onChange,
}) => {
  const [settingsOpen,    setSettingsOpen]    = useState(false);
  const [connectionOpen,  setConnectionOpen]  = useState(false);
  const { customizeMode } = useSettings();
  const { status } = useConnection();

  return (
    <>
      <View style={styles.wrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {CONTROLLERS.map(ctrl => {
            const active = ctrl === current;
            return (
              <TouchableOpacity
                key={ctrl}
                style={[
                  styles.tab,
                  active && { backgroundColor: ACCENT_COLORS[ctrl], borderColor: ACCENT_COLORS[ctrl] },
                ]}
                onPress={() => onChange(ctrl)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {CONTROLLER_LABELS[ctrl]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Connection 📡 button with status dot */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setConnectionOpen(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.iconText}>📡</Text>
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[status] ?? '#444' }]} />
        </TouchableOpacity>

        {/* Settings gear */}
        <TouchableOpacity
          style={[styles.iconBtn, customizeMode && styles.gearBtnActive]}
          onPress={() => setSettingsOpen(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.iconText, customizeMode && styles.gearIconActive]}>
            {customizeMode ? '✎' : '⚙'}
          </Text>
        </TouchableOpacity>
      </View>

      <SettingsPanel    visible={settingsOpen}   onClose={() => setSettingsOpen(false)} />
      <ConnectionPanel  visible={connectionOpen} onClose={() => setConnectionOpen(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 38,
    backgroundColor: '#0d0d1a',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1a1a2e',
  },
  tabText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  iconBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    borderRadius: 18,
  },
  gearBtnActive: {
    backgroundColor: 'rgba(124,77,255,0.2)',
  },
  iconText: {
    fontSize: 16,
    color: '#666',
  },
  gearIconActive: {
    color: '#7c4dff',
  },
  statusDot: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#0d0d1a',
  },
});
