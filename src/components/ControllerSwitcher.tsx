import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { SettingsPanel } from './SettingsPanel';
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

export const ControllerSwitcher: React.FC<ControllerSwitcherProps> = ({
  current,
  onChange,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { customizeMode } = useSettings();

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

        {/* Settings gear */}
        <TouchableOpacity
          style={[styles.gearBtn, customizeMode && styles.gearBtnActive]}
          onPress={() => setSettingsOpen(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.gearIcon, customizeMode && styles.gearIconActive]}>
            {customizeMode ? '✎' : '⚙'}
          </Text>
        </TouchableOpacity>
      </View>

      <SettingsPanel visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
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
  gearBtn: {
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
  gearIcon: {
    fontSize: 16,
    color: '#666',
  },
  gearIconActive: {
    color: '#7c4dff',
  },
});
