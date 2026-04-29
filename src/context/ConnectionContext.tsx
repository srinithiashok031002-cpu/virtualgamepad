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
import { PermissionsAndroid, Platform, ToastAndroid } from 'react-native';
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

  // Track current mode in a ref so the WiFi callback closure always sees fresh value
  const modeRef = useRef<ConnectionMode>('none');

  const wifi = useRef(new WifiConnection(s => {
    // Only update mode/status if we're actually in WiFi mode.
    // This prevents a failed WiFi attempt from killing an active BT connection.
    if (modeRef.current !== 'wifi') return;
    setStatus(s as ConnectionStatus);
    if (s === 'disconnected' || s === 'error') setMode('none');
  })).current;

  const stickState = useRef<StickState>({ lx: 0, ly: 0, rx: 0, ry: 0 });
  const buttonMask = useRef(0); // 16-bit bitmask

  // Keep modeRef in sync with state so callbacks always have the latest value
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // ── WiFi ──────────────────────────────────────────────────────────────────

  const connectWifi = useCallback(() => {
    // Don't clobber an active Bluetooth connection
    if (modeRef.current === 'bluetooth') {
      ToastAndroid.show('Disconnect Bluetooth first before connecting via WiFi.', ToastAndroid.LONG);
      return;
    }
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
    // Don't clobber an active WiFi connection
    if (modeRef.current === 'wifi') {
      ToastAndroid.show('Disconnect WiFi first before connecting via Bluetooth.', ToastAndroid.LONG);
      return;
    }
    // Immediate feedback so user knows the tap registered (works inside Modals)
    ToastAndroid.show('Starting Bluetooth…', ToastAndroid.SHORT);

    const ok = await requestBluetoothPermissions();
    if (!ok) {
      const msg = 'Nearby Devices permission denied. Go to Settings → Apps → VirtualGamePad → Permissions → Nearby devices → Allow.';
      setBtError(msg);
      ToastAndroid.showWithGravityAndOffset(msg, ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 80);
      return;
    }

    // Set connecting state, then yield 80 ms so React renders the UI change
    // before we block on the native HID profile bind
    setMode('bluetooth');
    setStatus('connecting');
    await new Promise<void>(resolve => setTimeout(resolve, 80));

    try {
      const devices = await BluetoothHid.startAdvertising();
      setBtDevices(devices ?? []);
      ToastAndroid.show('Phone is discoverable — select it on your TV', ToastAndroid.LONG);
    } catch (e: any) {
      const msg = e?.message ?? String(e) ?? 'Unknown BT error';
      setBtError(msg);
      setMode('none');
      setStatus('error');
      ToastAndroid.showWithGravityAndOffset(
        'BT Error: ' + msg, ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 80,
      );
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
