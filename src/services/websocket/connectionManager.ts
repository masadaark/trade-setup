import type { ConnectionManagerConfig, ConnectionState } from './types';

const DEFAULT_HEARTBEAT_MS = 30_000;
const DEFAULT_BASE_RECONNECT_MS = 1_000;
const DEFAULT_MAX_RECONNECT_MS = 30_000;
const DEFAULT_MAX_ATTEMPTS = 12;

type StateListener = (state: ConnectionState, error?: string) => void;

/** Reusable WebSocket client with reconnect + heartbeat */
export class ConnectionManager {
  readonly name: string;
  private config: ConnectionManagerConfig;
  private ws: WebSocket | null = null;
  private state: ConnectionState = 'idle';
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private lastMessageAt = 0;
  private intentionalClose = false;
  private listeners = new Set<StateListener>();

  constructor(config: ConnectionManagerConfig) {
    this.name = config.name;
    this.config = {
      heartbeatMs: DEFAULT_HEARTBEAT_MS,
      baseReconnectMs: DEFAULT_BASE_RECONNECT_MS,
      maxReconnectMs: DEFAULT_MAX_RECONNECT_MS,
      maxReconnectAttempts: DEFAULT_MAX_ATTEMPTS,
      ...config,
    };
  }

  getState(): ConnectionState {
    return this.state;
  }

  onStateChange(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  connect(): void {
    if (this.state === 'connecting' || this.state === 'open') return;
    this.intentionalClose = false;
    this.openSocket();
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.clearTimers();
    this.setState('closed');
    this.ws?.close();
    this.ws = null;
  }

  send(data: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  private setState(next: ConnectionState, error?: string): void {
    this.state = next;
    for (const listener of this.listeners) listener(next, error);
  }

  private resolveUrl(): string {
    const { url } = this.config;
    return typeof url === 'function' ? url() : url;
  }

  private openSocket(): void {
    this.clearReconnectTimer();
    const isReconnect = this.reconnectAttempt > 0;
    this.setState(isReconnect ? 'reconnecting' : 'connecting');

    try {
      this.ws = new WebSocket(this.resolveUrl());
    } catch (err) {
      this.handleFailure(err instanceof Error ? err.message : 'WebSocket create failed');
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.lastMessageAt = Date.now();
      this.setState('open');
      this.config.onOpen?.(this.ws!);
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      this.lastMessageAt = Date.now();
      this.config.onMessage(String(event.data));
    };

    this.ws.onerror = () => {
      this.setState('error', `${this.name}: connection error`);
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      this.ws = null;
      if (this.intentionalClose) {
        this.setState('closed');
        return;
      }
      this.scheduleReconnect();
    };
  }

  private handleFailure(message: string): void {
    this.setState('error', message);
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    const max = this.config.maxReconnectAttempts ?? DEFAULT_MAX_ATTEMPTS;
    if (this.reconnectAttempt >= max) {
      this.setState('error', `${this.name}: max reconnect attempts reached`);
      return;
    }

    const base = this.config.baseReconnectMs ?? DEFAULT_BASE_RECONNECT_MS;
    const cap = this.config.maxReconnectMs ?? DEFAULT_MAX_RECONNECT_MS;
    const delay = Math.min(base * 2 ** this.reconnectAttempt, cap);
    this.reconnectAttempt += 1;
    this.setState('reconnecting');

    this.reconnectTimer = setTimeout(() => this.openSocket(), delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    const interval = this.config.heartbeatMs ?? DEFAULT_HEARTBEAT_MS;
    this.heartbeatTimer = setInterval(() => {
      const stale = Date.now() - this.lastMessageAt > interval * 2;
      const customStale = this.config.heartbeatCheck?.(this.lastMessageAt) ?? stale;
      if (customStale && this.ws) {
        this.ws.close();
      }
    }, interval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearTimers(): void {
    this.stopHeartbeat();
    this.clearReconnectTimer();
  }
}
