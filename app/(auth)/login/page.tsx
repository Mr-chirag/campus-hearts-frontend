import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to Campus Hearts with your college email.",
};

export default function LoginPage() {
  return (
    // useSearchParams (for ?next=) needs a Suspense boundary or the whole
    // route opts out of static rendering.
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
