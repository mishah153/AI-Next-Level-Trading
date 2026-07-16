import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-2 text-primary-foreground shadow-sm",
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path
          d="M3 15.5 8 10l3.5 3.5L18 6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="6" r="2.4" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-tight">
            AINextLevel
            <span className="text-primary">Trading</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Whale-Eye AI
          </span>
        </span>
      )}
    </span>
  );
}
