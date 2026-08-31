"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Ported from the app's Button: 56px pill, gradient primary→secondary, soft
 * brand-tinted shadow. The RN version animated a spring scale on press-in;
 * on the web that becomes `active:scale-[0.97]`, which is free and respects
 * prefers-reduced-motion via the global base rule.
 */
const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[transform,box-shadow,background-color,opacity] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-primary to-secondary text-white shadow-[0_8px_24px_-6px_rgba(255,77,109,0.55)] hover:shadow-[0_10px_28px_-6px_rgba(255,77,109,0.7)]",
        secondary: "bg-secondary text-white hover:bg-secondary/90",
        outline:
          "border border-primary bg-transparent text-primary-ink hover:bg-primary/5",
        ghost: "bg-transparent text-ink hover:bg-ink/5",
        subtle: "bg-surface text-ink border border-border hover:bg-surface-muted",
        danger: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        // The app's control height. Comfortably above the 44px tap-target floor.
        lg: "h-14 px-8 text-[17px]",
        md: "h-12 px-6 text-[15px]",
        sm: "h-9 px-4 text-sm",
        icon: "h-11 w-11 p-0",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "lg", block: false },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, block, loading, asChild, children, disabled, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, block }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden />
            <span>Processing…</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
