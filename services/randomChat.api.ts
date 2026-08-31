import { api } from "./api";
import type { RandomChatSession, RevealResponse } from "@/types";

export const randomChatApi = {
  join: async (): Promise<RandomChatSession> => {
    const response = await api.post<RandomChatSession>("/random-chat/join");
    return response.data;
  },

  reveal: async (sessionId: string): Promise<RevealResponse> => {
    const response = await api.post<RevealResponse>(`/random-chat/${sessionId}/reveal`);
    return response.data;
  },

  leave: async (sessionId: string): Promise<void> => {
    await api.post(`/random-chat/${sessionId}/leave`);
  },
};
