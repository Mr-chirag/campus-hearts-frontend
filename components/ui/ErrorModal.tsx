"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertCircle } from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import { Button } from "./Button";

/**
 * The single error surface for the whole site, mounted once in the root layout.
 * Stores push into `uiStore.setError()`; screens never render their own error
 * UI. Ported from the app's global <ErrorModal />.
 */
export function ErrorModal() {
  const error = useUiStore((s) => s.error);
  const clearError = useUiStore((s) => s.clearError);

  return (
    <Dialog.Root open={!!error} onOpenChange={(open) => !open && clearError()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[100] w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-surface p-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-danger/10">
            <AlertCircle className="size-7 text-danger" aria-hidden />
          </div>

          <Dialog.Title className="font-display text-lg font-bold text-ink">
            {error?.title ?? "Something went wrong"}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-subtext">
            {error?.message ?? ""}
          </Dialog.Description>

          <Button size="md" block className="mt-6" onClick={clearError}>
            Got it
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
