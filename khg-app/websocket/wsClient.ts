import { APP_CONFIG } from "../constants/config";
import { useAlertStore } from "../store/alertStore";
import { useSensorStore } from "../store/sensorStore";
import Toast from "react-native-toast-message";

// Exponential backoff delays (ms): 2s, 4s, 8s, 16s, 30s
const BACKOFF_DELAYS = [2000, 4000, 8000, 16000, 30000];
const MAX_RECONNECT_ATTEMPTS = 8; // Cap retries to prevent infinite log loops

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private isManuallyDisconnected = false;

  connect(forceReset = false) {
    if (forceReset) {
      this.reconnectAttempts = 0;
      if (this.ws) {
        try { this.ws.close(); } catch {}
        this.ws = null;
      }
    }

    // Prevent duplicate connections
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) return;

    this.isManuallyDisconnected = false;

    try {
      const url = APP_CONFIG.fastapiWsUrl;
      console.log(`[KHG-WS] Connecting to ${url}`);
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log("[KHG-WS] Connected to realtime stream");
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const { type, data } = msg;

          switch (type) {
            case "alert": {
              // ── New risk alert from backend AI engine ──────────────────────
              const newAlert = {
                id: data.id || `ws-${Date.now()}`,
                title: data.title || "Environmental Alert Triggered",
                body: data.body || "New hazard report registered in your immediate region.",
                hazard_type: data.hazard_type || "stagnant_water",
                risk_level: (data.risk_level || "moderate").toLowerCase(),
                region: data.region || "General",
                issued_at: data.issued_at ? new Date(data.issued_at).toLocaleTimeString() : new Date().toLocaleTimeString(),
                acknowledged: false,
                source: "sensor" as const,
              };

              useAlertStore.getState().addAlert(newAlert);

              // Show priority toast banner
              Toast.show({
                type: "error",
                text1: newAlert.title,
                text2: newAlert.body,
                visibilityTime: 6000,
              });
              break;
            }

            case "SENSOR_UPDATE": {
              // ── Live sensor reading from Smart Box or simulation ────────────
              if (data) {
                useSensorStore.getState().updateReading({
                  device_id: data.device_id,
                  device_name: data.device_name,
                  location_id: data.location_id,
                  location_type: data.location_type,
                  temperature: data.temperature,
                  humidity: data.humidity,
                  air_quality: data.air_quality,
                  uv_index: data.uv_index,
                  rainfall: data.rainfall,
                  overcrowding_index: data.overcrowding_index,
                  flood_risk: data.flood_risk,
                  safety_score: data.safety_score,
                  safety_level: data.safety_level,
                  predictions: data.predictions,
                  timestamp: data.timestamp || new Date().toISOString(),
                });
              }
              break;
            }

            case "CONNECTED": {
              console.log("[KHG-WS] Stream confirmed:", data?.message);
              break;
            }

            case "pong": {
              // Server responded to our ping keepalive
              break;
            }

            default: {
              // Unknown message type — silently ignore
              break;
            }
          }
        } catch {
          // Silently ignore non-JSON messages
        }
      };

      this.ws.onerror = () => {
        this.ws = null;
      };

      this.ws.onclose = (event) => {
        this.ws = null;
        this.stopHeartbeat();

        if (this.isManuallyDisconnected) return;
        if (event.code === 1000) return; // Normal close

        this.scheduleReconnect();
      };
    } catch (error) {
      console.warn("[KHG-WS] Connection error:", error);
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.isManuallyDisconnected = true;
    this.stopHeartbeat();
    if (this.ws) {
      try { this.ws.close(1000, "Client disconnected"); } catch {}
      this.ws = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log(`[KHG-WS] Reconnected ${MAX_RECONNECT_ATTEMPTS} times without backend server response. Pausing retries.`);
      return;
    }

    const delay = BACKOFF_DELAYS[Math.min(this.reconnectAttempts, BACKOFF_DELAYS.length - 1)];
    this.reconnectAttempts++;
    console.log(`[KHG-WS] Reconnecting in ${delay / 1000}s... (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
    setTimeout(() => {
      if (!this.isManuallyDisconnected) this.connect();
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30_000); // 30 second keepalive
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WebSocketClient();
