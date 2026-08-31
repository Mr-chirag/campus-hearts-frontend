import { create } from "zustand";
import { chatApi } from "@/services/chat.api";
import { apiErrorDetail, apiErrorMessage } from "@/services/api";
import { useUiStore } from "./uiStore";
import type { Message } from "@/types";

/** Matches the server's default page size for GET /chat/:matchId. */
const PAGE_SIZE = 50;

interface ChatState {
  messages: Record<string, Message[]>; // keyed by matchId
  hasMore: Record<string, boolean>; // is there older history to page into?
  isSending: boolean;
  isLoadingMessages: boolean;
  isLoadingEarlier: boolean;

  fetchMessages: (matchId: string, silent?: boolean) => Promise<void>;
  loadEarlierMessages: (matchId: string) => Promise<void>;
  sendMessage: (matchId: string, content: string) => Promise<Message | undefined>;
  receiveMessage: (matchId: string, message: Message) => void;
  markSeen: (matchId: string) => Promise<void>;
  handleSeenEvent: (matchId: string) => void;
  clearMessages: (matchId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  hasMore: {},
  isSending: false,
  isLoadingMessages: false,
  isLoadingEarlier: false,

  fetchMessages: async (matchId, silent = false) => {
    if (!silent) set({ isLoadingMessages: true });
    try {
      const msgs = await chatApi.getMessages(matchId, { limit: PAGE_SIZE });
      set((state) => ({
        messages: { ...state.messages, [matchId]: msgs },
        // A full page back means there is probably more history behind it.
        hasMore: { ...state.hasMore, [matchId]: msgs.length >= PAGE_SIZE },
      }));
    } catch (error) {
      console.error("Fetch Messages Error:", apiErrorDetail(error));
      if (!silent) {
        useUiStore
          .getState()
          .setError("Chat Error", apiErrorMessage(error, "Could not load messages."));
      }
    } finally {
      if (!silent) set({ isLoadingMessages: false });
    }
  },

  /** Pages backwards from the oldest message currently held. */
  loadEarlierMessages: async (matchId) => {
    const state = get();
    if (state.isLoadingEarlier || state.hasMore[matchId] === false) return;

    const current = state.messages[matchId] ?? [];
    const oldest = current[0];
    if (!oldest) return;

    set({ isLoadingEarlier: true });
    try {
      const older = await chatApi.getMessages(matchId, {
        before: oldest._id,
        limit: PAGE_SIZE,
      });

      set((s) => ({
        messages: { ...s.messages, [matchId]: [...older, ...(s.messages[matchId] ?? [])] },
        hasMore: { ...s.hasMore, [matchId]: older.length >= PAGE_SIZE },
      }));
    } catch (error) {
      console.error("Load Earlier Messages Error:", apiErrorDetail(error));
    } finally {
      set({ isLoadingEarlier: false });
    }
  },

  /**
   * Persists only. The CALLER must then emit `new message` on the socket —
   * the server does not broadcast on creation, it only rebroadcasts.
   */
  sendMessage: async (matchId, content) => {
    if (!content.trim()) return;
    set({ isSending: true });

    const tempMsg: Message = {
      _id: `temp_${Date.now()}`,
      matchId,
      senderId: { _id: "me", full_name: "You" },
      content,
      is_read: false,
      seen: false,
      seenAt: null,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] ?? []), tempMsg],
      },
    }));

    try {
      const sent = await chatApi.sendMessage(matchId, content);
      set((state) => ({
        messages: {
          ...state.messages,
          [matchId]: (state.messages[matchId] ?? []).map((m) =>
            m._id === tempMsg._id ? sent : m
          ),
        },
      }));
      return sent;
    } catch (error) {
      console.error("Send Message Error:", apiErrorDetail(error));
      // Remove the optimistic bubble on failure.
      set((state) => ({
        messages: {
          ...state.messages,
          [matchId]: (state.messages[matchId] ?? []).filter((m) => m._id !== tempMsg._id),
        },
      }));
      useUiStore
        .getState()
        .setError("Send Failed", apiErrorMessage(error, "Message could not be sent."));
    } finally {
      set({ isSending: false });
    }
  },

  /** Dedupes by _id — a socket echo of our own message must not double up. */
  receiveMessage: (matchId, message) => {
    set((state) => {
      const current = state.messages[matchId] ?? [];
      if (current.some((m) => m._id === message._id)) return state;
      return { messages: { ...state.messages, [matchId]: [...current, message] } };
    });
  },

  /** Called when the user OPENS a chat. Premium short-circuits server-side. */
  markSeen: async (matchId) => {
    try {
      await chatApi.markAsSeen(matchId);
    } catch (error) {
      // Silent — a missing seen receipt is not worth interrupting anyone.
      console.log("markSeen failed (non-critical):", apiErrorDetail(error));
    }
  },

  /** Socket 'messages seen' from the OTHER user — ticks our own sent messages. */
  handleSeenEvent: (matchId) => {
    set((state) => {
      const msgs = state.messages[matchId];
      if (!msgs) return state;

      const updated = msgs.map((m) => ({
        ...m,
        seen: true,
        seenAt: m.seenAt ?? new Date().toISOString(),
      }));

      return { messages: { ...state.messages, [matchId]: updated } };
    });
  },

  clearMessages: (matchId) => {
    set((state) => {
      const updated = { ...state.messages };
      delete updated[matchId];
      return { messages: updated };
    });
  },
}));
