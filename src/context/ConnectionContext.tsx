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
import { WifiConnection, WifiStatus, DEFAULT_PORT } from '../services/WifiConnection';
import { getButtonBit } from '../utils/buttonMap';
import { InputEvent } from '../types';
import BluetoothHid from '../../modules/bluetooth-hid';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConnectionMode = 'none' | 'wifi' | 'bluetooth';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ConnectionContextType {
  mode: ConnectionMode;
  status: ConnectionStatus;
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
    try {
      const devices = await BluetoothHid.startAdvertising();
      setBtDevices(devices ?? []);
    } catch (e) {
      console.warn('BT scan error', e);
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
      mode, status, wifiIp, wifiPort, btDevices, btConnectedId,
      setWifiIp, setWifiPort,
      connectWifi, disconnectWifi,
      scanBluetooth, connectBluetooth, disconnectBluetooth,
      sendEvent,
    }}>
      {children}
    </ConnectionContext.Provider>
  );
};
