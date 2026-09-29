"use client";

import { useState, type FormEvent } from "react";
import { Search, Loader2, ChevronDown } from "lucide-react";
import { CHAIN_LIST } from "@/lib/chains";
import type { ChainId } from "@/types";
import { Tooltip } from "./Tooltip";

interface SearchFormProps {
  onSubmit: (address: string, chainId: ChainId) => void;
  loading: boolean;
  initialAddress?: string;
  initialChain?: ChainId;
}

export function SearchForm({
  onSubmit,
  loading,
  initialAddress = "",
  initialChain = "1",
}: SearchFormProps) {
  const [address, setAddress] = useState(initialAddress);
  const [chainId, setChainId] = useState<ChainId>(initialChain);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed, chainId);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative shrink-0">
          <select
            value={chainId}
            onChange={(e) => setChainId(e.target.value as ChainId)}
            disabled={loading}
            className="appearance-none h-11 pl-3.5 pr-9 rounded-[10px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 focus:border-zinc-300 dark:focus:border-zinc-600 disabled:opacity-60 cursor-pointer"
            aria-label="Select chain"
          >
            {CHAIN_LIST.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x… contract address"
            disabled={loading}
            spellCheck={false}
            autoComplete="off"
            className="w-full h-11 pl-3.5 pr-11 rounded-[10px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 focus:border-zinc-300 dark:focus:border-zinc-600 disabled:opacity-60"
          />
          <Tooltip content="Analyze dependencies">
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-[8px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-40 transition-colors"
              aria-label="Search"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Search size={15} />
              )}
            </button>
          </Tooltip>
        </div>
      </div>
    </form>
  );
}
