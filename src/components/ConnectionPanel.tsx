/**
 * ConnectionPanel — fullscreen modal with WiFi and Bluetooth tabs.
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useConnection, BtDevice } from '../context/ConnectionContext';
import { DEFAULT_PORT } from '../services/WifiConnection';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type Tab = 'wifi' | 'bluetooth';

const STATUS_COLOR: Record<string, string> = {
  connected: '#4ade80',
  connecting: '#facc15',
  error: '#f87171',
  disconnected: '#555',
};

export const ConnectionPanel: React.FC<Props> = ({ visible, onClose }) => {
  const [tab, setTab] = useState<Tab>('wifi');
  const {
    mode, status, btError,
    wifiIp, wifiPort, setWifiIp, setWifiPort,
    connectWifi, disconnectWifi,
    btDevices, btConnectedId,
    scanBluetooth, connectBluetooth, disconnectBluetooth,
  } = useConnection();

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  return (
    <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Text style={styles.backBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📡  Connect to TV</Text>
          {/* Status badge */}
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[status] }]} />
            <Text style={[styles.statusText, { color: STATUS_COLOR[status] }]}>
              {mode === 'none' ? 'Not connected' : `${mode.toUpperCase()} — ${status}`}
            </Text>
            {isConnecting && <ActivityIndicator size="small" color="#facc15" style={{ marginLeft: 6 }} />}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['wifi', 'bluetooth'] as Tab[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'wifi' ? '📶  WiFi' : '🔵  Bluetooth'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
        >
          {tab === 'wifi' ? (
            <WifiTab
              ip={wifiIp} port={wifiPort}
              setIp={setWifiIp} setPort={setWifiPort}
              isConnected={isConnected && mode === 'wifi'}
              isConnecting={isConnecting && mode === 'wifi'}
              onConnect={connectWifi} onDisconnect={disconnectWifi}
            />
          ) : (
            <BluetoothTab
              devices={btDevices}
              connectedId={btConnectedId}
              isConnecting={isConnecting && mode === 'bluetooth'}
              error={btError}
              onScan={scanBluetooth}
              onConnect={connectBluetooth}
              onDisconnect={disconnectBluetooth}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ── WiFi Tab ─────────────────────────────────────────────────────────────────

interface WifiTabProps {
  ip: string; port: number;
  setIp: (s: string) => void; setPort: (n: number) => void;
  isConnected: boolean; isConnecting: boolean;
  onConnect: () => void; onDisconnect: () => void;
}

const WifiTab: React.FC<WifiTabProps> = ({
  ip, port, setIp, setPort, isConnected, isConnecting, onConnect, onDisconnect,
}) => (
  <View style={styles.tabContent}>
    <Text style={styles.hint}>
      Install the VirtualGamePad Companion app on your Android TV,{'\n'}
      then enter its IP address below.
    </Text>

    <Text style={styles.fieldLabel}>TV IP Address</Text>
    <TextInput
      style={styles.input}
      value={ip}
      onChangeText={setIp}
      placeholder="192.168.1.x"
      placeholderTextColor="#444"
      keyboardType="decimal-pad"
      editable={!isConnected}
    />

    <Text style={styles.fieldLabel}>Port (default {DEFAULT_PORT})</Text>
    <TextInput
      style={styles.input}
      value={String(port)}
      onChangeText={s => setPort(parseInt(s) || DEFAULT_PORT)}
      placeholder={String(DEFAULT_PORT)}
      placeholderTextColor="#444"
      keyboardType="number-pad"
      editable={!isConnected}
    />

    {isConnected ? (
      <TouchableOpacity style={[styles.actionBtn, styles.disconnectBtn]} onPress={onDisconnect}>
        <Text style={styles.actionBtnText}>Disconnect</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={[styles.actionBtn, (!ip || isConnecting) && styles.actionBtnDisabled]}
        onPress={onConnect}
        disabled={!ip || isConnecting}
      >
        <Text style={styles.actionBtnText}>{isConnecting ? 'Connecting…' : 'Connect'}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ── Bluetooth Tab ─────────────────────────────────────────────────────────────

interface BtTabProps {
  devices: BtDevice[]; connectedId: string | null;
  isConnecting: boolean;
  error: string | null;
  onScan: () => void;
  onConnect: (id: string) => void;
  onDisconnect: () => void;
}

const BluetoothTab: React.FC<BtTabProps> = ({
  devices, connectedId, isConnecting, error, onScan, onConnect, onDisconnect,
}) => (
  <View style={styles.tabContent}>
    {!connectedId && (
      <TouchableOpacity
        style={[styles.actionBtn, styles.actionBtnLarge, isConnecting && styles.actionBtnAdvertising]}
        onPress={onScan}
        disabled={isConnecting}
      >
        <Text style={styles.actionBtnText}>
          {isConnecting ? '📡  Advertising — waiting for TV…' : '🔍  Make Phone Discoverable'}
        </Text>
      </TouchableOpacity>
    )}

    {!isConnecting && !connectedId && !error && (
      <Text style={styles.hint}>
        Then on your TV: Settings → Remotes &amp; Accessories → Add Accessory → select{' '}
        <Text style={{ color: '#fff' }}>"VirtualGamePad"</Text>
      </Text>
    )}

    {isConnecting && (
      <View style={styles.advertisingBanner}>
        <Text style={styles.advertisingTitle}>📡  Phone is discoverable</Text>
        <Text style={styles.advertisingHint}>
          On your TV: Settings → Remotes &amp; Accessories → Add Accessory → select{' '}
          <Text style={{ color: '#fff', fontWeight: '700' }}>"VirtualGamePad"</Text>
        </Text>
      </View>
    )}

    {error && (
      <View style={styles.errorBanner}>
        <Text style={styles.errorTitle}>⚠️  Bluetooth Error</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )}

    {connectedId && (
      <TouchableOpacity style={[styles.actionBtn, styles.disconnectBtn]} onPress={onDisconnect}>
        <Text style={styles.actionBtnText}>Disconnect</Text>
      </TouchableOpacity>
    )}

    {devices.length > 0 && (
      <>
        <Text style={styles.sectionLabel}>PAIRED DEVICES — TAP TO CONNECT</Text>
        {devices.map(d => (
          <TouchableOpacity
            key={d.id}
            style={[styles.deviceRow, d.id === connectedId && styles.deviceRowActive]}
            onPress={() => d.id !== connectedId ? onConnect(d.id) : onDisconnect()}
          >
            <Text style={styles.deviceName}>{d.name || 'Unknown Device'}</Text>
            <Text style={[styles.deviceStatus, d.id === connectedId && { color: '#4ade80' }]}>
              {d.id === connectedId ? 'Connected ✓' : 'Tap to connect'}
            </Text>
          </TouchableOpacity>
        ))}
      </>
    )}
  </View>
);

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#13131f',
    paddingTop: RNStatusBar.currentHeight ?? 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e30',
    gap: 12,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: '#aaa', fontSize: 14, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  tabs: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1e1e30',
  },
  tabBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#1a1a2e', alignItems: 'center',
    borderWidth: 1, borderColor: '#2a2a3e',
  },
  tabBtnActive: { backgroundColor: '#1565c0', borderColor: '#1565c0' },
  tabText: { color: '#888', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  body: { flex: 1 },
  bodyContent: { padding: 20, gap: 14 },
  tabContent: { gap: 14 },
  hint: {
    color: '#666', fontSize: 13, lineHeight: 20,
    backgroundColor: '#1a1a2e', padding: 14, borderRadius: 12,
  },
  fieldLabel: { color: '#888', fontSize: 12, fontWeight: '600' },
  input: {
    backgroundColor: '#1a1a2e', color: '#fff',
    borderRadius: 10, borderWidth: 1, borderColor: '#2a2a3e',
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15,
  },
  actionBtn: {
    backgroundColor: '#1565c0', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  actionBtnLarge: { paddingVertical: 18 },
  actionBtnAdvertising: { backgroundColor: '#1a4a1a', borderWidth: 1, borderColor: '#4ade80' },
  actionBtnDisabled: { opacity: 0.4 },
  disconnectBtn: { backgroundColor: '#7f1d1d' },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  errorBanner: {
    backgroundColor: '#2a0f0f', borderRadius: 12,
    borderWidth: 1, borderColor: '#f87171', padding: 16, gap: 6,
  },
  errorTitle: { color: '#f87171', fontSize: 14, fontWeight: '700' },
  errorText: { color: '#ccc', fontSize: 13, lineHeight: 20 },
  advertisingBanner: {
    backgroundColor: '#0f2a0f', borderRadius: 12,
    borderWidth: 1, borderColor: '#4ade80', padding: 16, gap: 6,
  },
  advertisingTitle: { color: '#4ade80', fontSize: 15, fontWeight: '700' },
  advertisingHint: { color: '#aaa', fontSize: 13, lineHeight: 20 },
  sectionLabel: {
    color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
  },
  deviceRow: {
    backgroundColor: '#1a1a2e', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#2a2a3e',
  },
  deviceRowActive: { borderColor: '#4ade80' },
  deviceName: { color: '#ddd', fontSize: 15, fontWeight: '600' },
  deviceStatus: { color: '#555', fontSize: 12, marginTop: 3 },
});
