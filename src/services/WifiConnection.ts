/**
 * WiFi connection service.
 * Connects to the VirtualGamePad companion app on Android TV via WebSocket.
 * Sends normalised gamepad events as JSON.
 */

export type WifiStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WifiEvent {
  type: 'button' | 'axis' | 'dpad';
  bit?: number;        // button bit (0-15)
  state?: 0 | 1;      // 1=pressed, 0=released
  lx?: number;        // left stick X  -1.0 to 1.0
  ly?: number;        // left stick Y
  rx?: number;        // right stick X
  ry?: number;        // right stick Y
  dir?: string;       // dpad direction for raw passthrough
}

type StatusCallback = (s: WifiStatus) => void;

export const DEFAULT_PORT = 8765;

export class WifiConnection {
  private ws: WebSocket | null = null;
  private url = '';
  private onStatus: StatusCallback;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;

  constructor(onStatus: StatusCallback) {
    this.onStatus = onStatus;
  }

  connect(ip: string, port: number = DEFAULT_PORT) {
    this.shouldReconnect = true;
    this.url = `ws://${ip}:${port}`;
    this._open();
  }

  private _open() {
    if (this.ws) this._closeSocket();
    this.onStatus('connecting');
    const ws = new WebSocket(this.url);

    ws.onopen = () => this.onStatus('connected');
    ws.onerror = () => this.onStatus('error');
    ws.onclose = () => {
      this.onStatus('disconnected');
      if (this.shouldReconnect) {
        this.reconnectTimer = setTimeout(() => this._open(), 3000);
      }
    };

    this.ws = ws;
  }

  send(event: WifiEvent) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this._closeSocket();
    this.onStatus('disconnected');
  }

  private _closeSocket() {
    try { this.ws?.close(); } catch {}
    this.ws = null;
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
