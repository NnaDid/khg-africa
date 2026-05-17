import { APP_CONFIG } from "../constants/config";
import { useAlertStore } from "../store/alertStore";
import Toast from "react-native-toast-message";

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private pingInterval: any = null;

  connect() {
    if (this.ws) return;

    try {
      this.ws = new WebSocket(APP_CONFIG.fastapiWsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "alert") {
            const newAlert = {
              id: data.id || `ws-${Date.now()}`,
              title: data.title || "Environmental Alert Triggered",
              body: data.body || "New hazard report registered in your immediate region.",
              hazard_type: data.hazard_type || "stagnant_water",
              risk_level: data.risk_level || "critical",
              region: data.region || "General",
              issued_at: new Date().toLocaleTimeString(),
              acknowledged: false,
            };

            // Add alert to Zustand alert store
            useAlertStore.getState().addAlert(newAlert);

            // Trigger premium in-app warning notification banner
            Toast.show({
              type: "error",
              text1: newAlert.title,
              text2: newAlert.body,
            });
          }
        } catch {
          // Ignore parse errors on ping/pong messages
        }
      };

      this.ws.onerror = (error) => {
        this.ws = null;
      };

      this.ws.onclose = () => {
        this.ws = null;
        this.stopHeartbeat();
        this.attemptReconnect();
      };
    } catch {
      this.attemptReconnect();
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  private startHeartbeat() {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

export const wsClient = new WebSocketClient();
