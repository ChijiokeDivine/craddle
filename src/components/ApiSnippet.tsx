// components/ApiSnippet.tsx
"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { ChainId } from "@/types";

interface ApiSnippetProps {
  address: string;
  chainId: ChainId;
}

export function ApiSnippet({ address, chainId }: ApiSnippetProps) {
  const [origin, setOrigin] = useState("https://your-domain");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setOrigin(window.location.origin));
  }, []);

  const cmd = `curl "${origin}/api/deps?address=${address}&chainId=${chainId}"`;

  const copy = async () => {
    await navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section aria-label="API">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold">Use this data in your own code</h2>
        <span className="font-mono text-[11px] text-muted">{"// returns JSON"}</span>
      </div>
      <div className="flex items-stretch border-2 border-deep bg-deep text-[#f2f3ff] dark:border-line">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap px-4 py-3 font-mono text-xs sm:text-sm">
          <span className="select-none text-[#8f8fff]">$ </span>
          {cmd}
        </code>
        <button
          type="button"
          onClick={copy}
          className="flex shrink-0 items-center gap-1.5 border-l border-white/20 px-4 font-mono text-xs transition-colors hover:bg-brand"
          aria-label="Copy curl command"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </section>
  );
}
