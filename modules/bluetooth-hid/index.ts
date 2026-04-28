/**
 * JavaScript interface for the BluetoothHid native Expo module.
 * The phone advertises itself as a Bluetooth HID gamepad;
 * the Android TV connects to it like any other Bluetooth controller.
 */
import { requireNativeModule } from 'expo-modules-core';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BluetoothDevice {
  id: string;    // MAC address
  name: string;
}

export interface ConnectionStateEvent {
  deviceId: string;
  deviceName: string;
  connected: boolean;
}

export type ConnectionStateCallback = (e: ConnectionStateEvent) => void;

interface BluetoothHidModuleType {
  startAdvertising(): Promise<BluetoothDevice[]>;
  stopAdvertising(): Promise<void>;
  connect(deviceId: string): Promise<void>;
  disconnect(): Promise<void>;
  sendReport(buttons: number, lx: number, ly: number, rx: number, ry: number): Promise<void>;
  addListener(eventName: string, listener: (e: any) => void): { remove: () => void };
}

// ─── Native module ────────────────────────────────────────────────────────────

// requireNativeModule returns the module or throws if not available.
// We wrap in try/catch so the app can run in Expo Go (where BT HID isn't linked).
let BluetoothHidNative: BluetoothHidModuleType | null = null;
try {
  BluetoothHidNative = requireNativeModule('BluetoothHidModule');
} catch {
  // Running in Expo Go or web — BT HID not available
}

// ─── API ──────────────────────────────────────────────────────────────────────

const BluetoothHid = {
  /**
   * Start advertising the phone as a Bluetooth HID gamepad.
   * Returns the list of already-paired devices that can reconnect.
   */
  startAdvertising(): Promise<BluetoothDevice[]> {
    return BluetoothHidNative?.startAdvertising() ?? Promise.resolve([]);
  },

  /** Stop advertising. */
  stopAdvertising(): Promise<void> {
    return BluetoothHidNative?.stopAdvertising() ?? Promise.resolve();
  },

  /** Connect to a specific paired device by MAC address. */
  connect(deviceId: string): Promise<void> {
    return BluetoothHidNative?.connect(deviceId) ?? Promise.resolve();
  },

  /** Disconnect from the current HID host. */
  disconnect(): Promise<void> {
    return BluetoothHidNative?.disconnect() ?? Promise.resolve();
  },

  /**
   * Send a gamepad HID report.
   * @param buttons 16-bit button bitmask
   * @param lx      Left stick X  (-127 to 127)
   * @param ly      Left stick Y  (-127 to 127)
   * @param rx      Right stick X (-127 to 127)
   * @param ry      Right stick Y (-127 to 127)
   */
  sendReport(buttons: number, lx: number, ly: number, rx: number, ry: number): Promise<void> {
    return BluetoothHidNative?.sendReport(buttons, lx, ly, rx, ry) ?? Promise.resolve();
  },

  /** Subscribe to Bluetooth HID connection state changes. */
  addListener(
    event: 'onConnectionStateChange',
    listener: ConnectionStateCallback,
  ): { remove: () => void } {
    return BluetoothHidNative?.addListener(event, listener) ?? { remove: () => {} };
  },
};

export default BluetoothHid;
