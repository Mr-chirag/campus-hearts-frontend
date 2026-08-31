import { api } from "./api";
import type { Match, SwipeAction, SwipeProfile, SwipeResponse } from "@/types";

export const swipeApi = {
  getFeed: async () => {
    const response = await api.get<SwipeProfile[]>("/swipes/feed");
    return response.data;
  },

  swipe: async (swipedId: string, action: SwipeAction) => {
    const response = await api.post<SwipeResponse>("/swipes", { swipedId, action });
    return response.data;
  },

  getMatches: async () => {
    const response = await api.get<Match[]>("/swipes/matches");
    return response.data;
  },
};
