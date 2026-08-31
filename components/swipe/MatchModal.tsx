"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Heart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

interface MatchModalProps {
  open: boolean;
  onClose: () => void;
  matchId?: string;
  matchName: string;
  matchPhoto?: string;
  myPhoto?: string;
  myName?: string;
}

/**
 * Ported from the app's MatchAnimation — brand-flooded overlay, big heart, the
 * two avatars overlapping, "Send a message" / "Keep swiping".
 *
 * Radix Dialog underneath rather than a bare overlay, so it traps focus,
 * closes on Escape and announces itself. The staggered entrance is decorative
 * and the global prefers-reduced-motion rule flattens it.
 */
export function MatchModal({
  open,
  onClose,
  matchId,
  matchName,
  matchPhoto,
  myPhoto,
  myName,
}: MatchModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-gradient-to-b from-primary to-secondary"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 14 }}
                >
                  <Heart className="size-20 text-white" fill="white" aria-hidden />
                </motion.div>

                <Dialog.Title className="mt-6 font-display text-4xl font-extrabold text-white">
                  It&apos;s a match!
                </Dialog.Title>
                <Dialog.Description className="mt-3 max-w-sm text-balance text-lg text-white/90">
                  You and {matchName} liked each other. 💖
                </Dialog.Description>

                <div className="mt-10 flex items-center">
                  <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-full ring-4 ring-white"
                  >
                    <Avatar src={myPhoto} name={myName} size={104} />
                  </motion.div>
                  <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="-ml-6 rounded-full ring-4 ring-white"
                  >
                    <Avatar src={matchPhoto} name={matchName} size={104} />
                  </motion.div>
                </div>

                <div className="mt-12 flex w-full max-w-xs flex-col gap-3">
                  {matchId && (
                    <Button asChild variant="subtle" block>
                      <Link href={`/chat/${matchId}`}>Send a message</Link>
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2 font-semibold text-white/90 transition-colors hover:text-white"
                  >
                    Keep swiping
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
