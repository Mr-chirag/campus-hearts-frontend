import axios from "axios";
import { create } from "zustand";
import { userApi } from "@/services/user.api";
import { apiErrorDetail, apiErrorMessage } from "@/services/api";
import { useUiStore } from "./uiStore";
import type { ProfileSearchResult, ProfileView, PublicUser } from "@/types";

interface ProfileState {
  /** Cached by user id so revisiting a profile doesn't flash a spinner. */
  profiles: Record<string, PublicUser>;
  isLoadingProfile: boolean;
  profileViews: ProfileView[];
  isLoadingViews: boolean;

  /** Discover's profile-ID search. */
  searchResult: ProfileSearchResult | null;
  /** "No profile found…" / "Enter a valid ID…" — shown inline, not as a modal. */
  searchError: string | null;
  isSearching: boolean;

  fetchProfile: (userId: string) => Promise<PublicUser | undefined>;
  fetchProfileViews: () => Promise<void>;
  searchByProfileId: (profileId: string) => Promise<void>;
  clearSearch: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profiles: {},
  isLoadingProfile: false,
  profileViews: [],
  isLoadingViews: false,
  searchResult: null,
  searchError: null,
  isSearching: false,

  /**
   * ALWAYS hits the network, even on a cache hit — the request itself is what
   * records the profile view server-side, which is what feeds Analytics. The
   * cache exists only to avoid a spinner on the second visit. Do not add a
   * short-circuit here; it would silently empty "Who Viewed You".
   */
  fetchProfile: async (userId) => {
    set({ isLoadingProfile: true });
    try {
      const profile = await userApi.getUserById(userId);
      set((state) => ({ profiles: { ...state.profiles, [userId]: profile } }));
      return profile;
    } catch (error) {
      console.error("Fetch Profile Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError(
          "Profile Unavailable",
          apiErrorMessage(error, "Could not load this profile.")
        );
      return undefined;
    } finally {
      set({ isLoadingProfile: false });
    }
  },

  /**
   * A miss or a typo is an expected outcome of searching, not a failure, so
   * 400/404 land inline under the search box. Anything else (network, 5xx,
   * rate limit) goes through the global error modal like every other store.
   */
  searchByProfileId: async (profileId) => {
    set({ isSearching: true, searchError: null, searchResult: null });
    try {
      const searchResult = await userApi.searchByProfileId(profileId);
      set({ searchResult });
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 400 || status === 404) {
        set({ searchError: apiErrorMessage(error, "No profile found with that ID.") });
        return;
      }
      console.error("Profile Search Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError("Search Failed", apiErrorMessage(error, "Could not search right now."));
    } finally {
      set({ isSearching: false });
    }
  },

  clearSearch: () => set({ searchResult: null, searchError: null }),

  fetchProfileViews: async () => {
    set({ isLoadingViews: true });
    try {
      const profileViews = await userApi.getProfileViews();
      set({ profileViews });
    } catch (error) {
      console.error("Fetch Profile Views Error:", apiErrorDetail(error));
    } finally {
      set({ isLoadingViews: false });
    }
  },
}));
