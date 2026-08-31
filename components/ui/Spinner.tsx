import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-subtext">
      <Loader2 className={cn("size-5 animate-spin text-primary", className)} aria-hidden />
      <span className={label ? "text-sm" : "sr-only"}>{label ?? "Loading"}</span>
    </span>
  );
}
