// components/Pill.tsx
import type { ReactNode } from "react";

type Tone = "default" | "accent" | "warn" | "ok";

const TONES: Record<Tone, string> = {
  default: "border-line text-muted",
  accent: "border-accent/50 text-accent",
  warn: "border-warn/50 text-warn",
  ok: "border-ok/50 text-ok",
};

interface PillProps {
  children: ReactNode;
  tone?: Tone;
  /** Wrap the label in colons, e.g. :base: (the Hermes tag style) */
  colons?: boolean;
  className?: string;
}

export function Pill({ children, tone = "default", colons = false, className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center border px-1.5 py-0.5 font-mono text-[11px] leading-none ${TONES[tone]} ${className}`}
    >
      {colons ? <>:{children}:</> : children}
    </span>
  );
}
