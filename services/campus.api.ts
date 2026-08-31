import { api } from "./api";
import type {
  Confession,
  ConfessionResponseResult,
  Poll,
  TopProfile,
} from "@/types";

export const campusApi = {
  getPoll: async () => {
    const response = await api.get<{ poll: Poll; hasVoted: boolean }>("/campus/poll");
    return response.data;
  },

  votePoll: async (pollId: string, optionIndex: number) => {
    const response = await api.post(`/campus/poll/${pollId}/vote`, { optionIndex });
    return response.data;
  },

  getTopProfiles: async () => {
    const response = await api.get<TopProfile[]>("/campus/top-profiles");
    return response.data;
  },

  sendConfession: async (receiverId: string, content: string, isAnonymous: boolean) => {
    const response = await api.post("/campus/confession", {
      receiverId,
      content,
      isAnonymous,
    });
    return response.data;
  },

  getReceivedConfessions: async () => {
    const response = await api.get<Confession[]>("/campus/confessions/received");
    return response.data;
  },

  getSentConfessions: async () => {
    const response = await api.get<Confession[]>("/campus/confessions/sent");
    return response.data;
  },

  /** Accepting creates a Match; the sender stays anonymous until they reveal. */
  respondToConfession: async (confessionId: string, action: "accept" | "reject") => {
    const response = await api.put<ConfessionResponseResult>(
      `/campus/confession/${confessionId}/respond`,
      { action }
    );
    return response.data;
  },

  /** Sender-only: drops anonymity on an already-accepted confession. */
  revealConfessionSender: async (confessionId: string) => {
    const response = await api.post<{ message: string; matchId: string }>(
      `/campus/confession/${confessionId}/reveal`
    );
    return response.data;
  },
};
