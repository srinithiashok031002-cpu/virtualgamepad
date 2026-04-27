import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
  return (
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
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 38,
    backgroundColor: '#0d0d1a',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
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
});
