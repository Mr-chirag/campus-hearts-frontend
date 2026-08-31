import axios from "axios";
import { API_URL } from "./config";
import { clearToken, getToken } from "@/lib/token";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * The app's 401 interceptor cleared the token but left the Zustand store
 * believing it was authenticated, so the UI stayed on a logged-in screen until
 * the next manual navigation. Importing authStore here would be circular
 * (api → authStore → auth.api → api), so the store registers itself instead.
 */
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  onUnauthorized = handler;
};

// Request: attach the Bearer token.
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error fetching token for request:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: a 401 means the 30-day token expired or was revoked.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

/** Pulls the server's message out of an axios error, with a sane fallback. */
export const apiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
};

/** The payload worth logging — the server's body, not axios's wrapper. */
export const apiErrorDetail = (error: unknown): unknown => {
  if (axios.isAxiosError(error)) return error.response?.data ?? error.message;
  return error;
};
