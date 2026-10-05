// components/ExploreTrail.tsx
"use client";

import { ArrowLeft, ChevronRight } from "lucide-react";
import { shortenAddress } from "@/lib/chains";

export interface TrailEntry {
  address: string;
  chainId: string;
  label?: string;
}

interface ExploreTrailProps {
  trail: TrailEntry[];
  onJump: (index: number) => void;
}

export function ExploreTrail({ trail, onJump }: ExploreTrailProps) {
  if (trail.length < 2) return null;

  return (
    <nav aria-label="Exploration path" className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
      <button
        type="button"
        onClick={() => onJump(trail.length - 2)}
        className="inline-flex shrink-0 items-center gap-1 border border-line bg-card px-2 py-1 transition-colors hover:border-accent hover:text-accent"
      >
        <ArrowLeft size={12} />
        Back
      </button>
      <ol className="flex items-center gap-1">
        {trail.map((t, i) => {
          const last = i === trail.length - 1;
          const text = t.label || shortenAddress(t.address, 4);
          return (
            <li key={`${t.chainId}:${t.address}:${i}`} className="flex shrink-0 items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="text-muted" />}
              {last ? (
                <span aria-current="page" className="bg-brand px-2 py-1 text-brand-ink">
                  {text}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  className="px-2 py-1 text-muted underline-offset-4 hover:text-accent hover:underline"
                >
                  {text}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
