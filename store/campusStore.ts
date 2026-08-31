import { create } from "zustand";
import { toast } from "sonner";
import { campusApi } from "@/services/campus.api";
import { apiErrorDetail, apiErrorMessage } from "@/services/api";
import { useUiStore } from "./uiStore";
import type { Confession, ConfessionResponseResult, Poll, TopProfile } from "@/types";

interface CampusState {
  poll: Poll | null;
  hasVoted: boolean;
  topProfiles: TopProfile[];
  confessions: Confession[];
  sentConfessions: Confession[];
  isLoadingPoll: boolean;
  isLoadingProfiles: boolean;
  isLoadingConfessions: boolean;
  isVoting: boolean;
  respondingToId: string | null;

  fetchPoll: () => Promise<void>;
  votePoll: (pollId: string, optionIndex: number) => Promise<void>;
  fetchTopProfiles: () => Promise<void>;
  fetchReceivedConfessions: () => Promise<void>;
  fetchSentConfessions: () => Promise<void>;
  sendConfession: (receiverId: string, content: string, isAnonymous: boolean) => Promise<void>;
  respondToConfession: (
    confessionId: string,
    action: "accept" | "reject"
  ) => Promise<ConfessionResponseResult | undefined>;
  revealConfessionSender: (confessionId: string) => Promise<void>;
}

export const useCampusStore = create<CampusState>((set, get) => ({
  poll: null,
  hasVoted: false,
  topProfiles: [],
  confessions: [],
  sentConfessions: [],
  isLoadingPoll: false,
  isLoadingProfiles: false,
  isLoadingConfessions: false,
  isVoting: false,
  respondingToId: null,

  fetchPoll: async () => {
    set({ isLoadingPoll: true });
    try {
      const { poll, hasVoted } = await campusApi.getPoll();
      set({ poll, hasVoted });
    } catch (error) {
      console.error("Fetch Poll Error:", apiErrorDetail(error));
    } finally {
      set({ isLoadingPoll: false });
    }
  },

  /**
   * `hasVoted` comes from the SERVER, which is the only thing that can stop a
   * second vote. Never gate solely on local state — and always handle the
   * rejection, because the backend's lean comparison is what enforces it.
   */
  votePoll: async (pollId, optionIndex) => {
    set({ isVoting: true });
    try {
      await campusApi.votePoll(pollId, optionIndex);
      set({ hasVoted: true });
      const { poll } = await campusApi.getPoll(); // refresh counts
      set({ poll });
    } catch (error) {
      console.error("Vote Poll Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError("Vote Failed", apiErrorMessage(error, "Could not submit your vote."));
      // Re-sync with the server — a 400 usually means we already voted.
      get().fetchPoll();
    } finally {
      set({ isVoting: false });
    }
  },

  fetchTopProfiles: async () => {
    set({ isLoadingProfiles: true });
    try {
      const topProfiles = await campusApi.getTopProfiles();
      set({ topProfiles });
    } catch (error) {
      console.error("Fetch Top Profiles Error:", apiErrorDetail(error));
    } finally {
      set({ isLoadingProfiles: false });
    }
  },

  fetchReceivedConfessions: async () => {
    set({ isLoadingConfessions: true });
    try {
      const confessions = await campusApi.getReceivedConfessions();
      set({ confessions });
    } catch (error) {
      console.error("Fetch Confessions Error:", apiErrorDetail(error));
    } finally {
      set({ isLoadingConfessions: false });
    }
  },

  fetchSentConfessions: async () => {
    set({ isLoadingConfessions: true });
    try {
      const sentConfessions = await campusApi.getSentConfessions();
      set({ sentConfessions });
    } catch (error) {
      console.error("Fetch Sent Confessions Error:", apiErrorDetail(error));
    } finally {
      set({ isLoadingConfessions: false });
    }
  },

  sendConfession: async (receiverId, content, isAnonymous) => {
    try {
      await campusApi.sendConfession(receiverId, content, isAnonymous);
      // Keep the Sent tab honest without needing a manual refresh.
      get().fetchSentConfessions();
    } catch (error) {
      console.error("Send Confession Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError("Send Failed", apiErrorMessage(error, "Could not send confession."));
      throw error;
    }
  },

  respondToConfession: async (confessionId, action) => {
    set({ respondingToId: confessionId });
    try {
      const result = await campusApi.respondToConfession(confessionId, action);

      // Patch locally so the card updates without a full refetch.
      set((state) => ({
        confessions: state.confessions.map((c) =>
          c._id === confessionId
            ? { ...c, status: result.status, matchId: result.matchId ?? c.matchId }
            : c
        ),
      }));

      toast.success(
        action === "accept" ? "Confession accepted 💖" : "Confession rejected",
        action === "accept"
          ? { description: "You can chat now — they stay anonymous for now." }
          : undefined
      );

      return result;
    } catch (error) {
      console.error("Respond Confession Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError(
          "Action Failed",
          apiErrorMessage(error, "Could not respond to this confession.")
        );
      return undefined;
    } finally {
      set({ respondingToId: null });
    }
  },

  /** Sender-only. Clearing anonymousUserId is what makes it an ordinary match. */
  revealConfessionSender: async (confessionId) => {
    set({ respondingToId: confessionId });
    try {
      await campusApi.revealConfessionSender(confessionId);
      set((state) => ({
        sentConfessions: state.sentConfessions.map((c) =>
          c._id === confessionId ? { ...c, senderRevealed: true } : c
        ),
      }));
      toast.success("Identity revealed 👋");
    } catch (error) {
      console.error("Reveal Confession Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError("Reveal Failed", apiErrorMessage(error, "Could not reveal your identity."));
    } finally {
      set({ respondingToId: null });
    }
  },
}));
