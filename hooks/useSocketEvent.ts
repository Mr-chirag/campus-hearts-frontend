"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { socket } from "@/services/socket";

/**
 * Subscribe to a socket event for the lifetime of a component.
 *
 * THIS HOOK IS MANDATORY — do not call `socket.on()` directly from a component.
 *
 * React StrictMode mounts every component twice in development. A raw
 * `socket.on()` in an effect without a matching `off()` therefore registers the
 * handler twice, and every incoming message renders twice. The same leak
 * accumulates in production across route changes, since the socket is a
 * module-level singleton that outlives any page.
 *
 * The handler is held in a ref (updated in an effect, never during render) so a
 * caller can pass an inline arrow function without the subscription tearing
 * down and re-establishing on every render.
 */
export function useSocketEvent<T = unknown>(
  event: string,
  handler: (payload: T) => void,
  enabled = true
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (payload: T) => handlerRef.current(payload);
    socket.on(event, listener);

    return () => {
      socket.off(event, listener);
    };
  }, [event, enabled]);
}

/* -------------------------------------------------------------------------- */
/* Connection state                                                           */
/* -------------------------------------------------------------------------- */

const subscribeToConnection = (onStoreChange: () => void) => {
  socket.on("connect", onStoreChange);
  socket.on("disconnect", onStoreChange);
  return () => {
    socket.off("connect", onStoreChange);
    socket.off("disconnect", onStoreChange);
  };
};

const getConnectionSnapshot = () => socket.connected;
const getServerConnectionSnapshot = () => false;

/** Live connection state, for the "reconnecting…" banner. */
export function useSocketConnected(): boolean {
  return useSyncExternalStore(
    subscribeToConnection,
    getConnectionSnapshot,
    getServerConnectionSnapshot
  );
}
