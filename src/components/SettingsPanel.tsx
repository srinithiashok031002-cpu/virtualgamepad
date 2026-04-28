/**
 * SettingsPanel — slides up as a modal sheet.
 * Sections:
 *   • Display  — transparency slider
 *   • Input    — sensitivity slider, show input log toggle
 *   • Layout   — customize mode toggle + reset
 */
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { SimpleSlider } from './SimpleSlider';

interface SettingsPanelProps {
  visible: boolean;
  onClose: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const ToggleRow: React.FC<{
  label: string;
  description?: string;
  value: boolean;
  onToggle: () => void;
}> = ({ label, description, value, onToggle }) => (
  <View style={styles.toggleRow}>
    <View style={styles.toggleInfo}>
      <Text style={styles.toggleLabel}>{label}</Text>
      {description ? <Text style={styles.toggleDesc}>{description}</Text> : null}
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: '#2a2a3e', true: '#7c4dff' }}
      thumbColor={value ? '#fff' : '#555'}
    />
  </View>
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ visible, onClose }) => {
  const {
    showInputLog, toggleInputLog,
    customizeMode, toggleCustomizeMode,
    transparency, setTransparency,
    sensitivity, setSensitivity,
    resetOffsets,
  } = useSettings();

  const sensitivityPct = (sensitivity / 100).toFixed(2) + '×';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚙  Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

          {/* ── Display ── */}
          <Section title="DISPLAY">
            <SimpleSlider
              label="Transparency"
              value={transparency}
              min={0}
              max={80}
              accentColor="#7c4dff"
              onChange={setTransparency}
              formatValue={v => `${v}%`}
            />
          </Section>

          {/* ── Input ── */}
          <Section title="INPUT">
            <SimpleSlider
              label="Sensitivity"
              value={sensitivity}
              min={50}
              max={200}
              accentColor="#00bcd4"
              onChange={setSensitivity}
              formatValue={v => (v / 100).toFixed(2) + '×'}
            />
            <ToggleRow
              label="Show Input Log"
              description="Overlays button presses — touches pass through"
              value={showInputLog}
              onToggle={toggleInputLog}
            />
          </Section>

          {/* ── Layout ── */}
          <Section title="LAYOUT">
            <ToggleRow
              label="Customize Layout"
              description="Drag any button group to reposition it"
              value={customizeMode}
              onToggle={toggleCustomizeMode}
            />
            {customizeMode && (
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => { resetOffsets(); }}
                activeOpacity={0.7}
              >
                <Text style={styles.resetBtnText}>↺  Reset All Positions</Text>
              </TouchableOpacity>
            )}
          </Section>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: '#13131f',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    borderColor: '#2a2a3e',
    maxHeight: '72%',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  handle: {
    width: 38,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e30',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#7c4dff',
    borderRadius: 10,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    marginTop: 4,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    color: '#555',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  toggleInfo: {
    flex: 1,
    paddingRight: 12,
  },
  toggleLabel: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleDesc: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  resetBtn: {
    marginTop: 12,
    backgroundColor: '#1e1e30',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#ff6b6b',
    fontSize: 13,
    fontWeight: '700',
  },
});
