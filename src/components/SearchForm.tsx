// components/SearchForm.tsx
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Search, Loader2, ChevronDown } from "lucide-react";
import { CHAIN_LIST, isValidAddress } from "@/lib/chains";
import type { ChainId } from "@/types";

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
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the fields in step when the app navigates (explore, recent, trail).
  useEffect(() => {
    queueMicrotask(() => setAddress(initialAddress));
  }, [initialAddress]);
  useEffect(() => {
    queueMicrotask(() => setChainId(initialChain));
  }, [initialChain]);

  // "/" focuses the address field from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing =
        !!t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const trimmed = address.trim();
  const invalid = trimmed.length > 0 && !isValidAddress(trimmed);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed || invalid || loading) return;
    onSubmit(trimmed, chainId);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <div className="flex flex-col border-2 border-deep bg-[#f2f3ff] text-deep shadow-[6px_6px_0_0_var(--deep)] sm:flex-row">
        <div className="relative shrink-0 border-b-2 border-deep sm:border-b-0 sm:border-r-2">
          <select
            value={chainId}
            onChange={(e) => setChainId(e.target.value as ChainId)}
            disabled={loading}
            className="h-12 w-full cursor-pointer appearance-none bg-black pl-3.5 pr-9 text-sm font-medium focus:outline-none disabled:opacity-60 sm:w-auto text-white"
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
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
          />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x… contract address"
          disabled={loading}
          spellCheck={false}
          autoComplete="off"
          aria-label="Contract address"
          aria-invalid={invalid}
          className="h-12 min-w-0 flex-1 bg-transparent px-3.5 font-mono text-sm placeholder:text-deep/45 focus:outline-none disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={loading || !trimmed || invalid}
          className="inline-flex h-12 items-center justify-center gap-2 bg-deep px-5 text-sm font-semibold text-[#f2f3ff] transition-colors hover:bg-[#1a1a6e] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Search size={15} />
          )}
          {loading ? "Scanning" : "Analyze"}
        </button>
      </div>

      {invalid && (
        <p role="alert" className="mt-3 font-mono text-xs text-brand-ink">
          {"// expected 0x followed by 40 hex characters"}
        </p>
      )}
    </form>
  );
}
