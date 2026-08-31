import { create } from "zustand";
import { randomChatApi } from "@/services/randomChat.api";
import { socket } from "@/services/socket";
import { apiErrorMessage } from "@/services/api";
import { useUiStore } from "./uiStore";
import type { RandomChatSession, RevealResponse } from "@/types";

export interface RandomMessage {
  id: string;
  content: string;
  from: "me" | "stranger";
  timestamp: string;
}

type SessionStatus = "idle" | "searching" | "waiting" | "chatting" | "reveal" | "left";

interface RandomChatState {
  status: SessionStatus;
  sessionId: string | null;
  messages: RandomMessage[];
  isPartnerConnected: boolean;
  isRevealing: boolean;
  revealResult: RevealResponse | null;
  isLoading: boolean;

  joinQueue: () => Promise<void>;
  sendMessage: (content: string) => void;
  reveal: () => Promise<void>;
  leaveSession: () => Promise<void>;
  /** Fire-and-forget teardown for pagehide/beforeunload — cannot await there. */
  abandonSession: () => void;
  reset: () => void;

  /**
   * Reducers for the socket events. The subscription itself lives in the page
   * via `useSocketEvent`, which owns cleanup — having a second subscribe path
   * in here would eventually leak from whichever one got forgotten.
   */
  partnerJoined: () => void;
  partnerLeft: () => void;
  receiveStrangerMessage: (content: string) => void;
}

const IDLE = {
  status: "idle" as SessionStatus,
  sessionId: null,
  messages: [] as RandomMessage[],
  isPartnerConnected: false,
  revealResult: null,
  isLoading: false,
};

export const useRandomChatStore = create<RandomChatState>((set, get) => ({
  ...IDLE,
  isRevealing: false,

  joinQueue: async () => {
    set({ status: "searching", isLoading: true, messages: [], revealResult: null });
    try {
      const session: RandomChatSession = await randomChatApi.join();
      set({ sessionId: session.sessionId });

      // Membership is verified server-side before the room join is honoured.
      socket.emit("join random chat", session.sessionId);

      if (session.status === "waiting") {
        // user1: parked in the queue, waiting for `partner_joined`.
        set({ status: "waiting", isLoading: false });
      } else {
        // user2: paired instantly by the atomic findOneAndUpdate.
        set({ status: "chatting", isPartnerConnected: true, isLoading: false });
      }
    } catch (error) {
      set({ status: "idle", isLoading: false });
      useUiStore
        .getState()
        .setError("Queue Failed", apiErrorMessage(error, "Could not join the queue."));
    }
  },

  sendMessage: (content) => {
    const { sessionId } = get();
    if (!sessionId || !content.trim()) return;

    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `local_${Date.now()}`,
          content,
          from: "me",
          timestamp: new Date().toISOString(),
        },
      ],
    }));

    socket.emit("random text", { sessionId, content, from: "me" });
  },

  reveal: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    set({ isRevealing: true });
    try {
      const result = await randomChatApi.reveal(sessionId);
      set({ revealResult: result, status: "reveal", isRevealing: false });
    } catch (error) {
      set({ isRevealing: false });
      useUiStore
        .getState()
        .setError("Reveal Failed", apiErrorMessage(error, "Could not reveal identity."));
    }
  },

  leaveSession: async () => {
    const { sessionId } = get();
    if (sessionId) {
      socket.emit("leave random chat", sessionId);
      try {
        await randomChatApi.leave(sessionId);
      } catch {
        // Best-effort; the room TTL-expires after 300s regardless.
      }
    }
    set({ ...IDLE });
  },

  /**
   * The tab is going away. No awaiting is possible here, so this emits over the
   * already-open websocket (which the browser flushes on close) and lets the
   * server tell the partner. The 300s TTL on the session is the backstop if
   * even that does not make it out.
   */
  abandonSession: () => {
    const { sessionId } = get();
    if (sessionId) socket.emit("leave random chat", sessionId);
  },

  reset: () => set({ ...IDLE }),

  partnerJoined: () => set({ status: "chatting", isPartnerConnected: true }),

  partnerLeft: () => set({ status: "left" }),

  receiveStrangerMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `stranger_${Date.now()}_${state.messages.length}`,
          content,
          from: "stranger",
          timestamp: new Date().toISOString(),
        },
      ],
    })),
}));
