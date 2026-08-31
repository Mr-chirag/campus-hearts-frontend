"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";
import { Drawer } from "vaul";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";

interface ResponsiveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * ONE of only two components in the codebase permitted to fork on viewport.
 *
 * A centred modal is right on a desktop and wrong on a phone, where the thumb
 * is at the bottom of the screen and a dialog fights the keyboard. So: Radix
 * Dialog at `lg+`, vaul Drawer below it — same props, same children, same a11y
 * contract. Everything else in the app differs by Tailwind breakpoint only.
 */
export function ResponsiveSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ResponsiveSheetProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 w-[min(92vw,32rem)] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card border border-border bg-surface p-6 shadow-2xl",
              className
            )}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="font-display text-xl font-bold text-ink">
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="mt-1 text-sm text-subtext">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-subtext transition-colors hover:bg-surface-muted hover:text-ink"
                aria-label="Close"
              >
                <X className="size-5" />
              </Dialog.Close>
            </div>
            {children}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/40" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-card border-t border-border bg-surface pb-safe outline-none",
            className
          )}
        >
          {/* Grab handle — the affordance that says "drag me down". */}
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-accent" aria-hidden />
          <div className="overflow-y-auto px-5 pb-6 pt-4">
            <Drawer.Title className="font-display text-xl font-bold text-ink">
              {title}
            </Drawer.Title>
            {description && (
              <Drawer.Description className="mt-1 text-sm text-subtext">
                {description}
              </Drawer.Description>
            )}
            <div className="mt-4">{children}</div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
