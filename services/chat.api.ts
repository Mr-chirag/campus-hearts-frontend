import { api } from "./api";
import type { Message } from "@/types";

export const chatApi = {
  /**
   * Persists the message. The socket emit is a SEPARATE, mandatory step done by
   * the caller — the server does not broadcast on creation, so a client that
   * skips `socket.emit('new message')` silently fails to deliver in realtime.
   */
  sendMessage: async (matchId: string, content: string) => {
    const response = await api.post<Message>(`/chat/${matchId}`, { content });
    return response.data;
  },

  /**
   * Returns the most recent page, oldest-first. Pass `before` (a message _id)
   * to page further back through the history.
   */
  getMessages: async (matchId: string, opts?: { before?: string; limit?: number }) => {
    const response = await api.get<Message[]>(`/chat/${matchId}`, {
      params: { before: opts?.before, limit: opts?.limit },
    });
    return response.data;
  },

  /** Premium users short-circuit server-side and never emit a seen receipt. */
  markAsSeen: async (matchId: string) => {
    const response = await api.put<{ message: string; count: number }>(
      `/chat/${matchId}/seen`
    );
    return response.data;
  },
};
