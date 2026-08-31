import { create } from "zustand";
import { userApi } from "@/services/user.api";
import { apiErrorDetail, apiErrorMessage } from "@/services/api";
import { useUiStore } from "./uiStore";
import type { ProfileView, PublicUser } from "@/types";

interface ProfileState {
  /** Cached by user id so revisiting a profile doesn't flash a spinner. */
  profiles: Record<string, PublicUser>;
  isLoadingProfile: boolean;
  profileViews: ProfileView[];
  isLoadingViews: boolean;

  fetchProfile: (userId: string) => Promise<PublicUser | undefined>;
  fetchProfileViews: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profiles: {},
  isLoadingProfile: false,
  profileViews: [],
  isLoadingViews: false,

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
