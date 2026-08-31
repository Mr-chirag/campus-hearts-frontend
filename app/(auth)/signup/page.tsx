import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { SignupWizard } from "@/components/auth/SignupWizard";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Join Campus Hearts with your college email. Verified students only — it takes about a minute.",
};

export default function SignupPage() {
  return (
    // The wizard reads ?step= from useSearchParams, which needs a boundary.
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      }
    >
      <SignupWizard />
    </Suspense>
  );
}
