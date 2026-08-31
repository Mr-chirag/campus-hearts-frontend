import { api } from "./api";
import type {
  CreatedOrder,
  PlanId,
  PremiumPlan,
  RazorpayPaymentResult,
  SubscriptionStatus,
} from "@/types";

export const paymentApi = {
  /** Prices live on the server, in paise. Never hardcode them client-side. */
  getPlans: async () => {
    const response = await api.get<PremiumPlan[]>("/payment/plans");
    return response.data;
  },

  createOrder: async (plan: PlanId) => {
    const response = await api.post<CreatedOrder>("/payment/create-order", { plan });
    return response.data;
  },

  verifyPayment: async (payload: RazorpayPaymentResult) => {
    const response = await api.post<{ message: string; premium_until: string }>(
      "/payment/verify",
      payload
    );
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get<SubscriptionStatus>("/payment/status");
    return response.data;
  },
};
