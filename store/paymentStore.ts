import { create } from "zustand";
import { toast } from "sonner";
import { paymentApi } from "@/services/payment.api";
import {
  RazorpayUnavailableError,
  isUserCancellation,
  openRazorpayCheckout,
} from "@/services/razorpay";
import { apiErrorDetail, apiErrorMessage } from "@/services/api";
import { useAuthStore } from "./authStore";
import { useUiStore } from "./uiStore";
import type { PlanId, PremiumPlan, SubscriptionStatus } from "@/types";

interface PaymentState {
  plans: PremiumPlan[];
  status: SubscriptionStatus | null;
  isLoadingPlans: boolean;
  purchasingPlanId: PlanId | null;

  fetchPlans: () => Promise<void>;
  fetchStatus: () => Promise<void>;
  purchase: (planId: PlanId) => Promise<boolean>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  plans: [],
  status: null,
  isLoadingPlans: false,
  purchasingPlanId: null,

  fetchPlans: async () => {
    set({ isLoadingPlans: true });
    try {
      const plans = await paymentApi.getPlans();
      set({ plans });
    } catch (error) {
      console.error("Fetch Plans Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError("Plans Unavailable", apiErrorMessage(error, "Could not load premium plans."));
    } finally {
      set({ isLoadingPlans: false });
    }
  },

  fetchStatus: async () => {
    try {
      const status = await paymentApi.getStatus();
      set({ status });

      // The server downgrades an expired subscription on read, so mirror
      // whatever it just told us onto the cached user.
      const { user, setUser } = useAuthStore.getState();
      if (user && user.is_premium !== status.is_premium) {
        setUser({ ...user, is_premium: status.is_premium });
      }
    } catch (error) {
      console.error("Fetch Subscription Status Error:", apiErrorDetail(error));
    }
  },

  /**
   * create order → Razorpay sheet → SERVER-SIDE signature verification.
   * Premium is granted only by that last step. Nothing here flips it locally
   * before the server has re-derived the HMAC.
   */
  purchase: async (planId) => {
    set({ purchasingPlanId: planId });
    try {
      const order = await paymentApi.createOrder(planId);
      const user = useAuthStore.getState().user;

      const result = await openRazorpayCheckout({
        // The key id comes from the SERVER's create-order response — the
        // secret never leaves the backend.
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Campus Hearts",
        description: order.plan_label,
        order_id: order.order_id,
        prefill: { email: user?.email, name: user?.full_name },
        theme: { color: "#FF4D6D" },
      });

      await paymentApi.verifyPayment(result);

      const { user: current, setUser } = useAuthStore.getState();
      if (current) setUser({ ...current, is_premium: true });

      toast.success("Premium activated! 👑");
      return true;
    } catch (error) {
      if (isUserCancellation(error)) {
        // Closing the sheet is not a failure worth a modal.
        return false;
      }

      if (error instanceof RazorpayUnavailableError) {
        useUiStore.getState().setError("Payments Unavailable", error.message);
        return false;
      }

      console.error("Purchase Error:", apiErrorDetail(error));
      useUiStore
        .getState()
        .setError(
          "Payment Failed",
          apiErrorMessage(
            error,
            "Your payment could not be completed. If money was deducted it will be refunded."
          )
        );
      return false;
    } finally {
      set({ purchasingPlanId: null });
    }
  },
}));
