import { create } from "zustand";
import { toast } from "sonner";
import { authApi } from "@/services/auth.api";
import { apiErrorDetail, apiErrorMessage, setUnauthorizedHandler } from "@/services/api";
import { connectSocket, disconnectSocket } from "@/services/socket";
import { clearToken, getToken, setToken } from "@/lib/token";
import { useUiStore } from "./uiStore";
import type { Gender, User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** True until the first loadUser() settles — gates the whole app shell. */
  isLoading: boolean;
  /** Guards against React StrictMode double-invoking the bootstrap. */
  hasBootstrapped: boolean;

  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    full_name: string;
    password: string;
    semester: number;
    branch: string;
    photos: string[];
    registrationToken: string;
    bio?: string;
    interests?: string[];
    gender?: Gender;
  }) => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<string>;
  uploadImage: (file: File) => Promise<string>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateSettings: (data: Partial<User>) => Promise<void>;
  deactivateAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  hasBootstrapped: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { token, ...userData } = await authApi.login({ email, password });
      await setToken(token);
      set({ user: userData, isAuthenticated: true });

      // Authenticated handshake — identity comes from the token, never a payload.
      await connectSocket();

      toast.success("Welcome back! 👋");
    } catch (error) {
      console.error("Login API Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError(
          "Login Failed",
          apiErrorMessage(error, "Invalid credentials or network error.")
        );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const { token, ...userData } = await authApi.register(data);
      await setToken(token);
      set({ user: userData, isAuthenticated: true });

      await connectSocket();

      toast.success("Account created! 🎉");
    } catch (error) {
      console.error("Register API Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError(
          "Signup Failed",
          apiErrorMessage(error, "Something went wrong while creating your account.")
        );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  sendOtp: async (email) => {
    set({ isLoading: true });
    try {
      await authApi.sendOtp(email);
      toast.success("Code sent 📧", { description: "Check your inbox." });
    } catch (error) {
      console.error("SendOTP API Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError(
          "Could Not Send Code",
          apiErrorMessage(error, "Failed to send the code. Check your connection and try again.")
        );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /** Returns the 30-minute registration ticket that register() must present. */
  verifyOtp: async (email, otp) => {
    set({ isLoading: true });
    try {
      const { registrationToken } = await authApi.verifyOtp(email, otp);
      toast.success("Email verified ✅");
      return registrationToken;
    } catch (error) {
      console.error("VerifyOTP API Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError(
          "Verification Failed",
          apiErrorMessage(error, "That code did not work. Please try again.")
        );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  uploadImage: async (file) => {
    try {
      const { url } = await authApi.uploadImage(file);
      return url;
    } catch (error) {
      console.error("Upload API Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError(
          "Image Upload Failed",
          apiErrorMessage(error, "Could not upload that photo. Try a smaller file.")
        );
      throw error;
    }
  },

  loadUser: async () => {
    try {
      const token = await getToken();
      if (token) {
        const userData = await authApi.getProfile();
        set({ user: userData, isAuthenticated: true });
        await connectSocket();
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch {
      await clearToken();
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false, hasBootstrapped: true });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const updatedUser = await authApi.updateProfile(data);
      set((state) => ({ user: { ...state.user, ...updatedUser } as User }));
      toast.success("Profile updated ✨");
    } catch (error) {
      console.error("Update Profile API Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError(
          "Update Failed",
          apiErrorMessage(error, "Could not update your profile. Please try again.")
        );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Settings toggles: applied optimistically so the switch never lags under the
   * thumb, then rolled back if the server rejects it. Deliberately does NOT
   * touch isLoading — that would flip the whole screen into a spinner.
   */
  updateSettings: async (data) => {
    const previous = get().user;
    if (!previous) return;

    set({ user: { ...previous, ...data } });

    try {
      const updatedUser = await authApi.updateProfile(data);
      set((state) => ({ user: { ...state.user, ...updatedUser } as User }));
    } catch (error) {
      set({ user: previous }); // roll back
      console.error("Update Settings API Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError(
          "Settings Not Saved",
          apiErrorMessage(error, "Could not save that change. Please try again.")
        );
    }
  },

  deactivateAccount: async () => {
    set({ isLoading: true });
    try {
      await authApi.deactivateAccount();
      disconnectSocket();
      await clearToken();
      set({ user: null, isAuthenticated: false });
      toast.success("Account deactivated", {
        description: "Log back in any time to restore it.",
      });
    } catch (error) {
      console.error("Deactivate Account API Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError(
          "Could Not Deactivate",
          apiErrorMessage(error, "Something went wrong. Please try again.")
        );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    disconnectSocket();
    await clearToken();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));

/**
 * A 401 from any request means the token is gone. The app only cleared storage
 * and left the store believing it was authenticated; here the store is cleared
 * too, so <AuthGuard> redirects immediately instead of on the next navigation.
 */
setUnauthorizedHandler(() => {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) return;
  disconnectSocket();
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
});
