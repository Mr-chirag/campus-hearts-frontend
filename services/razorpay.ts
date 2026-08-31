"use client";

import type { RazorpayPaymentResult } from "@/types";

/**
 * Razorpay Checkout, web edition.
 *
 * The app wraps `react-native-razorpay`, a native module that CANNOT run in
 * Expo Go — importing it at module scope crashes there, so the app has to
 * `require` it lazily behind an availability check. On the web that entire
 * class of problem disappears: Checkout is a script tag.
 *
 * The script is still loaded on demand rather than in the root layout, so the
 * ~90kB only ships for people who actually open the premium page.
 */

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export class RazorpayUnavailableError extends Error {
  constructor(message = "Payments could not be loaded. Check your connection and try again.") {
    super(message);
    this.name = "RazorpayUnavailableError";
  }
}

/** Thrown when the user closes the sheet — not a failure worth a modal. */
export class RazorpayCancelledError extends Error {
  constructor() {
    super("Payment cancelled");
    this.name = "RazorpayCancelledError";
  }
}

export const isUserCancellation = (error: unknown): boolean =>
  error instanceof RazorpayCancelledError;

interface RazorpayOptions {
  key: string;
  amount: number; // paise
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let loader: Promise<void> | null = null;

/** Injects the Checkout script once and resolves when `window.Razorpay` exists. */
const loadCheckout = (): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.reject(new RazorpayUnavailableError("Payments require a browser."));
  }
  if (window.Razorpay) return Promise.resolve();
  if (loader) return loader;

  loader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CHECKOUT_SRC}"]`
    );

    const done = () => (window.Razorpay ? resolve() : reject(new RazorpayUnavailableError()));

    if (existing) {
      existing.addEventListener("load", done, { once: true });
      existing.addEventListener("error", () => reject(new RazorpayUnavailableError()), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = done;
    script.onerror = () => {
      loader = null; // allow a retry on the next attempt
      reject(new RazorpayUnavailableError());
    };
    document.body.appendChild(script);
  });

  return loader;
};

/**
 * Opens the sheet and resolves with the triple the server needs to re-derive
 * the HMAC signature. Premium is granted ONLY by that server-side verification
 * — nothing here flips it locally.
 */
export const openRazorpayCheckout = (
  options: RazorpayOptions
): Promise<RazorpayPaymentResult> =>
  loadCheckout().then(
    () =>
      new Promise<RazorpayPaymentResult>((resolve, reject) => {
        const Razorpay = window.Razorpay;
        if (!Razorpay) return reject(new RazorpayUnavailableError());

        let settled = false;

        const instance = new Razorpay({
          ...options,
          handler: (response: RazorpayPaymentResult) => {
            settled = true;
            resolve(response);
          },
          modal: {
            ondismiss: () => {
              // Fires on close AND after a successful handler in some flows;
              // the flag keeps a completed payment from resolving as cancelled.
              if (!settled) reject(new RazorpayCancelledError());
            },
          },
        });

        instance.on("payment.failed", (payload: unknown) => {
          settled = true;
          const error = (payload as { error?: { description?: string } })?.error;
          reject(new Error(error?.description || "Your payment could not be completed."));
        });

        instance.open();
      })
  );
