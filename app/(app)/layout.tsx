import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { SessionProvider } from "@/components/layout/SessionProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthGuard>
        <AppShell>{children}</AppShell>
      </AuthGuard>
    </SessionProvider>
  );
}
