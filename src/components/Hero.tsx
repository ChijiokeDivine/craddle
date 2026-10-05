// components/Hero.tsx
"use client";

import { Clock, X } from "lucide-react";
import { SearchForm } from "./SearchForm";
import { Constellation } from "./Constellation";
import { EXAMPLES } from "@/lib/examples";
import { CHAIN_LIST, shortenAddress } from "@/lib/chains";
import type { RecentSearch } from "@/lib/history";
import type { ChainId } from "@/types";

interface HeroProps {
  /** Collapse to just the search bar once the user is working with results */
  compact: boolean;
  loading: boolean;
  initialAddress: string;
  initialChain: ChainId;
  recent: RecentSearch[];
  onSubmit: (address: string, chainId: ChainId) => void;
  onClearRecent: () => void;
}

const chip =
  "border border-white/40 px-2.5 py-1 font-mono text-xs text-brand-ink transition-colors hover:border-white hover:bg-[#f2f3ff] hover:text-deep";

export function Hero({
  compact,
  loading,
  initialAddress,
  initialChain,
  recent,
  onSubmit,
  onClearRecent,
}: HeroProps) {
  const form = (
    <SearchForm
      onSubmit={onSubmit}
      loading={loading}
      initialAddress={initialAddress}
      initialChain={initialChain}
    />
  );

  if (compact) {
    return (
      <section className="on-brand grid-bg bg-brand pb-8 pt-6 text-brand-ink">
        <div className="mx-auto max-w-6xl px-4">{form}</div>
      </section>
    );
  }

  return (
    <section className="on-brand grid-bg overflow-hidden bg-brand text-brand-ink">
      <div className="mx-auto max-w-4xl items-center gap-10 px-4 pb-14 pt-12 sm:pt-16  lg:pb-20">
        <div>
          <h1 className="text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
            What Your
            Contract
            <br />
            Depends On
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-brand-ink/85">
            Paste a contract address. craddle maps every contract it calls and
            every contract that calls it, across {CHAIN_LIST.length} chains.
          </p>

          <div className="mt-8">{form}</div>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-xs text-brand-ink/70">
              {"// try"}
            </span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.address}
                type="button"
                className={chip}
                onClick={() => onSubmit(ex.address, ex.chainId)}
              >
                {ex.label}
              </button>
            ))}
          </div>

          {recent.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="mr-1 inline-flex items-center gap-1 font-mono text-xs text-brand-ink/70">
                <Clock size={12} />
                {"// recent"}
              </span>
              {recent.map((r) => (
                <button
                  key={`${r.chainId}:${r.address}`}
                  type="button"
                  className={chip}
                  onClick={() => onSubmit(r.address, r.chainId)}
                >
                  {r.name || shortenAddress(r.address, 4)}
                </button>
              ))}
              <button
                type="button"
                onClick={onClearRecent}
                className="inline-flex items-center gap-1 px-1.5 py-1 font-mono text-xs text-brand-ink/70 hover:text-brand-ink"
                aria-label="Clear recent searches"
              >
                <X size={12} />
                clear
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
