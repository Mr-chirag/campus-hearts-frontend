import { io, type Socket } from "socket.io-client";
import { SERVER_URL, IS_DEV } from "./config";
import { getToken } from "@/lib/token";

/**
 * The server authenticates the handshake with a JWT and derives your identity
 * from it — a connection without a valid token is refused, and `setup`'s
 * payload is ignored. Always connect through `connectSocket()`; a bare
 * `socket.connect()` has no credentials and will be rejected.
 */
export const socket: Socket = io(SERVER_URL, {
  autoConnect: false,
  // The app forces websocket-only. On the web that strands anyone behind a
  // corporate proxy or captive portal that blocks the upgrade, so polling is
  // kept as a fallback — Socket.io upgrades to websocket when it can.
  transports: ["websocket", "polling"],
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 5000,
});

export const connectSocket = async (): Promise<void> => {
  const token = await getToken();
  if (!token) return;

  socket.auth = { token };

  // Reconnect so the new credentials are used for the handshake.
  if (socket.connected) socket.disconnect();
  socket.connect();
};

export const disconnectSocket = (): void => {
  if (socket.connected) socket.disconnect();
};

if (IS_DEV && typeof window !== "undefined") {
  socket.on("connect_error", (err) => console.warn("Socket connect error:", err.message));
  socket.on("unauthorized", (info) => console.warn("Socket rejected action:", info));
}
