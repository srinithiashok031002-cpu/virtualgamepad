/**
 * ConnectionContext
 * Manages active connection (WiFi or Bluetooth HID) and routes every
 * input event through the selected connection in addition to local logging.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { WifiConnection, WifiStatus, DEFAULT_PORT } from '../services/WifiConnection';
import { getButtonBit } from '../utils/buttonMap';
import { InputEvent } from '../types';
import BluetoothHid from '../../modules/bluetooth-hid';

// Request runtime BT permissions on Android 12+
async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android' || Platform.Version < 31) return true;
  const results = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
  ]);
  return Object.values(results).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConnectionMode = 'none' | 'wifi' | 'bluetooth';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ConnectionContextType {
  mode: ConnectionMode;
  status: ConnectionStatus;
  btError: string | null;
  wifiIp: string;
  wifiPort: number;
  btDevices: BtDevice[];
  btConnectedId: string | null;
  setWifiIp: (ip: string) => void;
  setWifiPort: (p: number) => void;
  connectWifi: () => void;
  disconnectWifi: () => void;
  scanBluetooth: () => void;
  connectBluetooth: (deviceId: string) => void;
  disconnectBluetooth: () => void;
  /** Call this from the input event pipeline to forward over the connection */
  sendEvent: (event: Omit<InputEvent, 'id' | 'timestamp'>) => void;
}

export interface BtDevice {
  id: string;
  name: string;
}

// ─── Analog stick state shared across all sticks ────────────────────────────

interface StickState { lx: number; ly: number; rx: number; ry: number; }

// ─── Context ─────────────────────────────────────────────────────────────────

const ConnectionContext = createContext<ConnectionContextType | null>(null);

export const useConnection = () => {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error('useConnection must be inside ConnectionProvider');
  return ctx;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ConnectionMode>('none');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [wifiIp, setWifiIp] = useState('');
  const [wifiPort, setWifiPort] = useState(DEFAULT_PORT);
  const [btDevices, setBtDevices] = useState<BtDevice[]>([]);
  const [btConnectedId, setBtConnectedId] = useState<string | null>(null);
  const [btError, setBtError] = useState<string | null>(null);

  const wifi = useRef(new WifiConnection(s => {
    setStatus(s as ConnectionStatus);
    if (s === 'disconnected' || s === 'error') setMode('none');
  })).current;

  const stickState = useRef<StickState>({ lx: 0, ly: 0, rx: 0, ry: 0 });
  const buttonMask = useRef(0); // 16-bit bitmask

  // ── WiFi ──────────────────────────────────────────────────────────────────

  const connectWifi = useCallback(() => {
    setMode('wifi');
    wifi.connect(wifiIp, wifiPort);
  }, [wifiIp, wifiPort]);

  const disconnectWifi = useCallback(() => {
    wifi.disconnect();
    setMode('none');
    setStatus('disconnected');
  }, []);

  // ── Bluetooth ─────────────────────────────────────────────────────────────

  const scanBluetooth = useCallback(async () => {
    setBtError(null);
    try {
      const ok = await requestBluetoothPermissions();
      if (!ok) {
        const msg = 'Bluetooth permissions denied.\n\nGo to Settings → Apps → VirtualGamePad → Permissions and enable Nearby Devices.';
        setBtError(msg);
        Alert.alert('Permission Required', msg);
        return;
      }
      setMode('bluetooth');
      setStatus('connecting');
      const devices = await BluetoothHid.startAdvertising();
      setBtDevices(devices ?? []);
      // Stay in 'connecting' until onConnectionStateChange fires from native module
    } catch (e: any) {
      const msg = e?.message ?? String(e) ?? 'Unknown error starting Bluetooth HID';
      console.warn('BT scan error', e);
      setBtError(msg);
      setMode('none');
      setStatus('error');
      Alert.alert('Bluetooth Error', msg);
    }
  }, []);

  const connectBluetooth = useCallback(async (deviceId: string) => {
    try {
      setMode('bluetooth');
      setStatus('connecting');
      await BluetoothHid.connect(deviceId);
      setBtConnectedId(deviceId);
      setStatus('connected');
    } catch (e) {
      setStatus('error');
      setMode('none');
    }
  }, []);

  const disconnectBluetooth = useCallback(async () => {
    try { await BluetoothHid.disconnect(); } catch {}
    setBtConnectedId(null);
    setMode('none');
    setStatus('disconnected');
  }, []);

  // Listen for BT connection state changes from native module
  useEffect(() => {
    const sub = BluetoothHid.addListener?.('onConnectionStateChange', (e: any) => {
      if (e.connected) {
        setStatus('connected');
        setBtConnectedId(e.deviceId);
        setMode('bluetooth');
      } else {
        setStatus('disconnected');
        setBtConnectedId(null);
        setMode('none');
      }
    });
    return () => sub?.remove?.();
  }, []);

  // ── Event routing ─────────────────────────────────────────────────────────

  const sendEvent = useCallback((event: Omit<InputEvent, 'id' | 'timestamp'>) => {
    if (mode === 'none') return;

    if (event.type === 'button' || event.type === 'dpad') {
      const bit = getButtonBit(event.name);
      if (bit < 0) return;
      const pressed = event.state === 'pressed' ? 1 : 0;

      // Update bitmask
      if (pressed) buttonMask.current |= (1 << bit);
      else         buttonMask.current &= ~(1 << bit);

      if (mode === 'wifi') {
        wifi.send({ type: 'button', bit, state: pressed as 0 | 1 });
      } else if (mode === 'bluetooth') {
        const s = stickState.current;
        BluetoothHid.sendReport(
          buttonMask.current,
          Math.round(s.lx * 127),
          Math.round(s.ly * 127),
          Math.round(s.rx * 127),
          Math.round(s.ry * 127),
        ).catch(() => {});
      }
    } else if (event.type === 'stick') {
      const pos = event.state as { x: number; y: number };
      const isLeft = event.name.toLowerCase().includes('left') ||
                     event.name.toLowerCase().includes('l stick') ||
                     event.name === 'Left Stick';

      if (isLeft) {
        stickState.current.lx = pos.x;
        stickState.current.ly = pos.y;
      } else {
        stickState.current.rx = pos.x;
        stickState.current.ry = pos.y;
      }

      const s = stickState.current;
      if (mode === 'wifi') {
        wifi.send({ type: 'axis', lx: s.lx, ly: s.ly, rx: s.rx, ry: s.ry });
      } else if (mode === 'bluetooth') {
        BluetoothHid.sendReport(
          buttonMask.current,
          Math.round(s.lx * 127),
          Math.round(s.ly * 127),
          Math.round(s.rx * 127),
          Math.round(s.ry * 127),
        ).catch(() => {});
      }
    }
  }, [mode]);

  return (
    <ConnectionContext.Provider value={{
      mode, status, btError, wifiIp, wifiPort, btDevices, btConnectedId,
      setWifiIp, setWifiPort,
      connectWifi, disconnectWifi,
      scanBluetooth, connectBluetooth, disconnectBluetooth,
      sendEvent,
    }}>
      {children}
    </ConnectionContext.Provider>
  );
};
