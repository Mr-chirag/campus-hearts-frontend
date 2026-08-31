"use client";

import { useEffect, useRef } from "react";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { disconnectSocket } from "@/services/socket";
import { useAuthStore } from "@/store/authStore";

/**
 * Everything session-shaped: the one-time `loadUser()` bootstrap, the socket
 * lifecycle, and the global <ErrorModal /> the stores push into.
 *
 * Mounted by the (app) and (auth) layouts — NOT the root layout, so the public
 * landing page never loads the auth/HTTP/websocket stack.
 *
 * `bootstrap` is opt-out because the (auth) group needs the error surface but
 * has no session to restore — proxy.ts already bounces anyone holding a token
 * away from /login before it renders.
 */
export function SessionProvider({
  children,
  bootstrap = true,
}: {
  children: React.ReactNode;
  bootstrap?: boolean;
}) {
  const loadUser = useAuthStore((s) => s.loadUser);
  const started = useRef(false);

  useEffect(() => {
    if (!bootstrap || started.current) return;
    // StrictMode mounts effects twice in dev; without this guard every reload
    // fires two GET /users/profile calls and two socket handshakes.
    started.current = true;
    void loadUser();

    return () => {
      disconnectSocket();
    };
  }, [bootstrap, loadUser]);

  return (
    <>
      {children}
      <ErrorModal />
    </>
  );
}
