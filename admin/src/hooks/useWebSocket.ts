import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/realtime';

// Reconnect backoff: 1s, 2s, 4s, 8s, 16s, 30s max
const BACKOFF_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const isMountedRef = useRef(true);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { addLiveAlert, updateSensorFeed, setWsConnected } = useAppStore();

  const clearPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[KHG-WS] Connected to realtime stream');
      reconnectAttemptRef.current = 0;
      setWsConnected(true);

      // Send keepalive ping every 30 seconds
      clearPingInterval();
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30_000);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { type, data } = msg;

        switch (type) {
          case 'SENSOR_UPDATE':
            // Live sensor reading from backend simulation or smart box hardware
            updateSensorFeed(data);
            break;

          case 'alert':
            // New risk alert — add to global live alerts list
            addLiveAlert(data);
            break;

          case 'SAFETY_SCORE_UPDATE':
            // Safety score updated for a location
            updateSensorFeed({ ...data, _type: 'safety_score' });
            break;

          case 'CONNECTED':
            console.log('[KHG-WS] Stream confirmed:', data?.message);
            break;

          case 'pong':
            // Server responded to our ping
            break;

          default:
            // Unknown message type — silently ignore
            break;
        }
      } catch {
        // Malformed JSON from server — ignore
      }
    };

    ws.onclose = (event) => {
      clearPingInterval();
      setWsConnected(false);

      if (!isMountedRef.current) return;
      if (event.code === 1000) return; // Normal close — don't reconnect

      // Exponential backoff reconnect
      const delay = BACKOFF_DELAYS[Math.min(reconnectAttemptRef.current, BACKOFF_DELAYS.length - 1)];
      reconnectAttemptRef.current++;
      console.log(`[KHG-WS] Disconnected. Reconnecting in ${delay / 1000}s... (attempt ${reconnectAttemptRef.current})`);
      setTimeout(connect, delay);
    };

    ws.onerror = (error) => {
      console.warn('[KHG-WS] Connection error:', error);
      ws.close();
    };
  }, [addLiveAlert, updateSensorFeed, setWsConnected, clearPingInterval]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      clearPingInterval();
      wsRef.current?.close(1000, 'Component unmounted');
    };
  }, [connect, clearPingInterval]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}
