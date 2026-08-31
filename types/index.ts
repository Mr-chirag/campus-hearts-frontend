/**
 * Domain types, extracted from the app's `services/*.api.ts` files where they
 * were declared inline. Shapes mirror the Express API exactly — do not
 * "improve" them here; the backend is the contract and it now serves two
 * clients (this site and the Expo app).
 */

/* -------------------------------------------------------------------------- */
/* User & auth                                                                */
/* -------------------------------------------------------------------------- */

/** Mirrors the enum in backend/models/userModel.js. */
export type Gender = "man" | "woman" | "non-binary" | "other";

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "man", label: "Man" },
  { value: "woman", label: "Woman" },
  { value: "non-binary", label: "Non-binary" },
  { value: "other", label: "Prefer to self-describe" },
];

export interface User {
  _id: string;
  full_name: string;
  email: string;
  semester: number;
  branch: string;
  is_premium: boolean;
  is_email_verified: boolean;
  profile_strength: number;
  bio?: string;
  interests?: string[];
  photos?: string[];
  /** null until the user fills it in — drives the "finish your profile" prompt. */
  gender?: Gender | null;
  /** Empty means "no preference"; the feed then shows every gender. */
  interested_in?: Gender[];
  is_active?: boolean;
  // Settings
  profile_paused?: boolean;
  seen_off?: boolean;
  notify_matches?: boolean;
  notify_messages?: boolean;
  notify_confessions?: boolean;
}

export interface AuthResponse extends User {
  token: string;
}

/** Another user's profile, as returned by GET /api/users/:id. */
export interface PublicUser extends User {
  createdAt?: string;
  updatedAt?: string;
}

/**
 * One row of GET /api/users/profile/views. The backend stores a single document
 * per (viewer, viewed) pair and increments `viewCount`, so this is a distinct
 * viewer, not a single visit.
 */
export interface ProfileView {
  _id: string;
  viewerId: {
    _id: string;
    full_name: string;
    photos?: string[];
    semester?: number | null;
    branch?: string | null;
    is_premium?: boolean;
    /** True when the server withheld this viewer's identity (free account). */
    is_hidden?: boolean;
  } | null; // null if the viewer's account was deleted
  viewCount: number;
  lastViewed: string;
  createdAt: string;
}

/** Fields `updateUserProfile` actually whitelists server-side. */
export interface EditableProfile {
  full_name: string;
  bio: string;
  semester: number;
  branch: string;
  interests: string[];
  photos: string[];
}

/** Boolean settings, the other half of the update whitelist. */
export interface UserSettings {
  profile_paused: boolean;
  seen_off: boolean;
  notify_matches: boolean;
  notify_messages: boolean;
  notify_confessions: boolean;
}

/* -------------------------------------------------------------------------- */
/* Swipes & matches                                                           */
/* -------------------------------------------------------------------------- */

export type SwipeAction = "like" | "pass" | "superlike";

export interface SwipeProfile {
  _id: string;
  full_name: string;
  email: string;
  semester: number;
  branch: string;
  photos?: string[];
  bio?: string;
  interests?: string[];
  profile_strength: number;
  is_premium: boolean;
  compatibility?: number;
}

/** The opaque sentinel the server sends instead of a real id when masked. */
export const ANONYMOUS_ID = "anonymous" as const;

export interface Match {
  _id: string; // the matchId
  createdAt: string;
  user: {
    /** 'anonymous' while the other party's identity is hidden — never a real id. */
    _id: string;
    full_name: string;
    photos?: string[];
    is_anonymous?: boolean;
  };
  /** True for a match created by accepting an anonymous confession. */
  isAnonymous?: boolean;
  /** True when *you* are the hidden party and can choose to reveal. */
  iAmAnonymous?: boolean;
  confessionId?: string | null;
}

/**
 * Daily allowance, returned on every swipe response so the UI can count down
 * without a second request. `null` where a value is unlimited — Infinity does
 * not survive JSON.
 */
export interface SwipeQuota {
  likes_remaining: number | null;
  superlikes_remaining: number | null;
  likes_per_day: number | null;
  superlikes_per_day: number;
  unlimited_likes: boolean;
  resets_at: string;
}

export interface SwipeResponse {
  message?: string;
  match?: {
    _id: string;
    users: string[];
  };
  swipe: unknown;
  quota?: SwipeQuota;
}

/* -------------------------------------------------------------------------- */
/* Chat                                                                       */
/* -------------------------------------------------------------------------- */

export interface MessageSender {
  _id: string;
  full_name: string;
  photos?: string[];
  is_premium?: boolean;
}

export interface Message {
  _id: string;
  matchId: string;
  senderId: MessageSender | string;
  content: string;
  is_read: boolean;
  seen: boolean; // Instagram-style seen receipt
  seenAt?: string | null;
  createdAt: string;
}

/** `senderId` arrives either populated or as a bare id string. */
export const senderIdOf = (message: Message): string =>
  typeof message.senderId === "string" ? message.senderId : message.senderId?._id;

/* -------------------------------------------------------------------------- */
/* Campus                                                                     */
/* -------------------------------------------------------------------------- */

export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  active: boolean;
}

export interface TopProfile {
  _id: string;
  full_name: string;
  profile_strength: number;
  is_premium: boolean;
  photos?: string[];
  semester?: number;
  branch?: string;
}

export interface Confession {
  _id: string;
  content: string;
  status: "pending" | "accepted" | "rejected";
  isAnonymous: boolean;
  senderRevealed?: boolean;
  matchId?: string | null;
  createdAt: string;
  /** Present on received confessions; masked while the sender is anonymous. */
  sender?: {
    _id?: string;
    full_name: string;
    photos?: string[];
  };
  /** Present on sent confessions — you always know who you wrote to. */
  receiver?: {
    _id: string;
    full_name: string;
    photos?: string[];
    semester?: number;
    branch?: string;
  };
}

export interface ConfessionResponseResult {
  message: string;
  status: "accepted" | "rejected";
  matchId?: string;
  isAnonymous?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Random chat                                                                */
/* -------------------------------------------------------------------------- */

export interface RandomChatSession {
  message: string;
  sessionId: string;
  status: "waiting" | "active";
  role: "user1" | "user2";
}

export interface RevealResponse {
  message: string;
  isMatch: boolean;
  match?: {
    _id: string;
    users: string[];
  };
}

/* -------------------------------------------------------------------------- */
/* Payments                                                                   */
/* -------------------------------------------------------------------------- */

/** Purchasable plans. 'trial' is deliberately excluded — it is granted, never bought. */
export type PlanId = "monthly" | "quarterly" | "yearly";

/** What GET /payment/status may report as the current entitlement. */
export type EntitlementPlan = PlanId | "trial";

/** Free Premium granted on signup. Mirrors TRIAL_DAYS in backend/utils/grantTrial.js. */
export const TRIAL_DAYS = 7;

/** GET /api/payment/plans — prices live on the server, never hardcode them. */
export interface PremiumPlan {
  id: PlanId;
  label: string;
  amount_paise: number;
  amount_inr: number;
  duration_days: number;
}

export interface CreatedOrder {
  order_id: string;
  amount: number; // paise
  currency: string;
  plan_label: string;
  key_id: string; // Razorpay publishable key, supplied by the server
}

/** The triple Razorpay hands back on success; the server re-derives the signature. */
export interface RazorpayPaymentResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface SubscriptionStatus {
  is_premium: boolean;
  plan?: EntitlementPlan;
  premium_until?: string;
  expired?: boolean;
  message?: string;
  /** True while the active entitlement is the free signup trial. */
  is_trial?: boolean;
  /** Whole days left on the current entitlement; 0 once expired. */
  days_remaining?: number;
}
