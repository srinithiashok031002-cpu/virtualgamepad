/**
 * ConnectionPanel — modal sheet with WiFi and Bluetooth tabs.
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📡  Connect to TV</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Status badge */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[status] }]} />
          <Text style={[styles.statusText, { color: STATUS_COLOR[status] }]}>
            {mode === 'none' ? 'Not connected' : `${mode.toUpperCase()} — ${status}`}
          </Text>
          {isConnecting && <ActivityIndicator size="small" color="#facc15" style={{ marginLeft: 8 }} />}
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

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
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
              error={status === 'error' && mode === 'none' ? btError : null}
              onScan={scanBluetooth}
              onConnect={connectBluetooth}
              onDisconnect={disconnectBluetooth}
            />
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
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
    {!isConnecting && !connectedId && !error && (
      <Text style={styles.hint}>
        Tap the button below, then on your Android TV go to{'\n'}
        Settings → Remotes &amp; Accessories → Add Accessory{'\n'}
        and select <Text style={{ color: '#fff' }}>"VirtualGamePad"</Text>.
      </Text>
    )}

    {error && (
      <View style={styles.errorBanner}>
        <Text style={styles.errorTitle}>⚠️  Bluetooth Error</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )}

    {isConnecting && (
      <View style={styles.advertisingBanner}>
        <Text style={styles.advertisingTitle}>📡  Phone is discoverable</Text>
        <Text style={styles.advertisingHint}>
          Now go to your TV:{'\n'}
          Settings → Remotes &amp; Accessories → Add Accessory{'\n'}
          and select <Text style={{ color: '#fff', fontWeight: '700' }}>"VirtualGamePad"</Text>
        </Text>
      </View>
    )}

    {!connectedId && (
      <TouchableOpacity style={[styles.actionBtn, isConnecting && styles.actionBtnAdvertising]} onPress={onScan} disabled={isConnecting}>
        <Text style={styles.actionBtnText}>
          {isConnecting ? '📡  Advertising — waiting for TV…' : '🔍  Make Phone Discoverable'}
        </Text>
      </TouchableOpacity>
    )}

    {connectedId ? (
      <TouchableOpacity style={[styles.actionBtn, styles.disconnectBtn]} onPress={onDisconnect}>
        <Text style={styles.actionBtnText}>Disconnect</Text>
      </TouchableOpacity>
    ) : null}

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
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: '#13131f',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    borderColor: '#2a2a3e',
    maxHeight: '80%',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  handle: {
    width: 38, height: 4,
    backgroundColor: '#333', borderRadius: 2,
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e1e30',
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  doneBtn: {
    paddingHorizontal: 12, paddingVertical: 4,
    backgroundColor: '#1565c0', borderRadius: 10,
  },
  doneBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  tabs: { flexDirection: 'row', gap: 8, paddingVertical: 10 },
  tabBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: '#1a1a2e', alignItems: 'center',
    borderWidth: 1, borderColor: '#2a2a3e',
  },
  tabBtnActive: { backgroundColor: '#1565c0', borderColor: '#1565c0' },
  tabText: { color: '#888', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  body: { flex: 1 },
  tabContent: { gap: 10 },
  hint: {
    color: '#666', fontSize: 12, lineHeight: 18,
    backgroundColor: '#1a1a2e', padding: 12, borderRadius: 10,
  },
  fieldLabel: { color: '#888', fontSize: 12, fontWeight: '600', marginTop: 4 },
  input: {
    backgroundColor: '#1a1a2e', color: '#fff',
    borderRadius: 10, borderWidth: 1, borderColor: '#2a2a3e',
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14,
  },
  actionBtn: {
    backgroundColor: '#1565c0', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center', marginTop: 4,
  },
  actionBtnAdvertising: { backgroundColor: '#1a4a1a', borderWidth: 1, borderColor: '#4ade80' },
  actionBtnDisabled: { opacity: 0.4 },
  disconnectBtn: { backgroundColor: '#7f1d1d' },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  errorBanner: {
    backgroundColor: '#2a0f0f', borderRadius: 12,
    borderWidth: 1, borderColor: '#f87171',
    padding: 14, gap: 6,
  },
  errorTitle: { color: '#f87171', fontSize: 13, fontWeight: '700' },
  errorText: { color: '#ccc', fontSize: 12, lineHeight: 18 },
  advertisingBanner: {
    backgroundColor: '#0f2a0f', borderRadius: 12,
    borderWidth: 1, borderColor: '#4ade80',
    padding: 14, gap: 6,
  },
  advertisingTitle: { color: '#4ade80', fontSize: 14, fontWeight: '700' },
  advertisingHint: { color: '#aaa', fontSize: 12, lineHeight: 18 },
  sectionLabel: {
    color: '#555', fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, marginTop: 16,
  },
  deviceRow: {
    backgroundColor: '#1a1a2e', borderRadius: 10,
    padding: 14, borderWidth: 1, borderColor: '#2a2a3e',
  },
  deviceRowActive: { borderColor: '#4ade80' },
  deviceName: { color: '#ddd', fontSize: 14, fontWeight: '600' },
  deviceStatus: { color: '#555', fontSize: 11, marginTop: 2 },
});
