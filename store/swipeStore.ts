import { create } from "zustand";
import { swipeApi } from "@/services/swipe.api";
import { apiErrorDetail, apiErrorMessage } from "@/services/api";
import { useUiStore } from "./uiStore";
import axios from "axios";
import type { Match, SwipeAction, SwipeProfile, SwipeQuota } from "@/types";

interface SwipeState {
  feed: SwipeProfile[];
  /**
   * Bumped on every successful feed load. The deck uses it as a React `key`,
   * so a refetch remounts the deck with a fresh index instead of the component
   * resetting its own state from a prop in an effect.
   */
  feedVersion: number;
  matches: Match[];
  isLoadingFeed: boolean;
  isLoadingMatches: boolean;
  isSwiping: boolean;
  /** Today's remaining allowance. Null until the first swipe reports it. */
  quota: SwipeQuota | null;
  /** Set when a swipe was refused for quota; drives the upgrade prompt. */
  quotaBlock: { reason: "like_quota" | "superlike_quota"; message: string } | null;
  clearQuotaBlock: () => void;

  fetchFeed: () => Promise<void>;
  swipeUser: (
    swipedId: string,
    action: SwipeAction
  ) => Promise<{ isMatch: boolean; matchId?: string }>;
  fetchMatches: () => Promise<void>;
}

export const useSwipeStore = create<SwipeState>((set, get) => ({
  feed: [],
  feedVersion: 0,
  matches: [],
  isLoadingFeed: false,
  isLoadingMatches: false,
  isSwiping: false,
  quota: null,
  quotaBlock: null,

  clearQuotaBlock: () => set({ quotaBlock: null }),

  fetchFeed: async () => {
    set({ isLoadingFeed: true });
    try {
      const feed = await swipeApi.getFeed();
      set((state) => ({ feed, feedVersion: state.feedVersion + 1 }));
    } catch (error) {
      console.error("Fetch Feed API Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError("Feed Error", apiErrorMessage(error, "Could not load your potential matches."));
    } finally {
      set({ isLoadingFeed: false });
    }
  },

  /**
   * Does NOT remove the swiped profile from `feed`. The deck owns card removal
   * visually; splicing the array here makes indices drift and submits the wrong
   * user on the next swipe. (Same reasoning as the app — preserved verbatim.)
   */
  swipeUser: async (swipedId, action) => {
    set({ isSwiping: true });
    try {
      const response = await swipeApi.swipe(swipedId, action);
      if (response.quota) set({ quota: response.quota });

      if (response.match) {
        get().fetchMatches(); // refresh in the background
        return { isMatch: true, matchId: response.match._id };
      }
      return { isMatch: false };
    } catch (error) {
      /**
       * 429 is the daily quota, not a failure. Routing it through the generic
       * <ErrorModal /> would read as "something broke" when the correct message
       * is "you've used today's likes" — with an upgrade path attached.
       */
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const data = error.response.data as {
          message?: string;
          reason?: "like_quota" | "superlike_quota";
          quota?: SwipeQuota;
        };
        if (data?.quota) set({ quota: data.quota });
        set({
          quotaBlock: {
            reason: data?.reason ?? "like_quota",
            message: data?.message ?? "You've reached today's limit.",
          },
        });
        return { isMatch: false };
      }

      console.error("Swipe API Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError("Swipe Failed", apiErrorMessage(error, "Could not save your interaction."));
      return { isMatch: false };
    } finally {
      set({ isSwiping: false });
    }
  },

  fetchMatches: async () => {
    set({ isLoadingMatches: true });
    try {
      const matches = await swipeApi.getMatches();
      set({ matches });
    } catch (error) {
      console.error("Fetch Matches API Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError("Matches Error", apiErrorMessage(error, "Could not load your matches."));
    } finally {
      set({ isLoadingMatches: false });
    }
  },
}));
