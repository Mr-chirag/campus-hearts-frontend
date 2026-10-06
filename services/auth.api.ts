import { api } from "./api";
import type { AuthResponse, Gender, User } from "@/types";

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post<AuthResponse>("/users/login", credentials);
    return response.data;
  },

  sendOtp: async (email: string) => {
    const response = await api.post<{ message: string }>("/users/send-otp", { email });
    return response.data;
  },

  /**
   * Swaps the emailed code for a short-lived registration ticket. The wizard
   * does this at step 2 and presents the ticket at step 4 — the 5-minute OTP
   * would have expired during the photo upload.
   */
  verifyOtp: async (email: string, otp: string) => {
    const response = await api.post<{
      message: string;
      email: string;
      registrationToken: string;
    }>("/users/verify-otp", { email, otp });
    return response.data;
  },

  /**
   * The server reads the email OUT OF THE TICKET, not the body — a caller
   * cannot verify one address and register another. Do not add an `email`
   * field here expecting it to be honoured.
   */
  register: async (data: {
    full_name: string;
    password: string;
    semester: number;
    branch: string;
    photos: string[];
    registrationToken: string;
    bio?: string;
    interests?: string[];
    gender?: Gender;
  }) => {
    const response = await api.post<AuthResponse>("/users", data);
    return response.data;
  },

  /**
   * Browser upload. The app had to hand FormData an {uri,name,type} object and
   * defeat axios's transform; a real File needs neither hack — letting the
   * browser set its own multipart boundary is required for the upload to parse.
   */
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post<{ url: string; message: string }>(
      "/upload",
      formData,
      { headers: { "Content-Type": undefined } }
    );
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<User>("/users/profile");
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.put<User>("/users/profile", data);
    return response.data;
  },

  /** Soft delete — data is retained and logging back in restores the account. */
  deactivateAccount: async () => {
    const response = await api.delete<{ message: string }>("/users/profile");
    return response.data;
  },
};
