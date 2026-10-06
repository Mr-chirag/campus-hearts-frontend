import { api } from "./api";
import type { ProfileSearchResult, ProfileView, PublicUser } from "@/types";

export const userApi = {
  /**
   * Fetching a profile is what RECORDS the view server-side — the backend
   * upserts a ProfileView on every call where the viewer isn't the owner.
   * This is why profileStore refetches even on a cache hit; do not add
   * client-side caching that skips the request.
   */
  getUserById: async (userId: string) => {
    const response = await api.get<PublicUser>(`/users/${userId}`);
    return response.data;
  },

  /** Finds a profile by its short public ID. 404s when nobody has that ID. */
  searchByProfileId: async (profileId: string) => {
    const response = await api.get<ProfileSearchResult>("/users/search", {
      params: { profile_id: profileId },
    });
    return response.data;
  },

  getProfileViews: async () => {
    const response = await api.get<ProfileView[]>("/users/profile/views");
    return response.data;
  },
};
