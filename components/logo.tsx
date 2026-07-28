import { cn } from "@/lib/utils";
import { SITE_SHORT_NAME } from "@/lib/site";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-bold", className)}>
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 shrink-0 text-primary"
        fill="none"
        aria-hidden="true"
      >
        <path d="M4 8h24v4H18v14h-4V12H4V8Z" fill="currentColor" />
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
      </svg>
      <span className="text-lg tracking-tight">{SITE_SHORT_NAME}</span>
    </span>
  );
}
