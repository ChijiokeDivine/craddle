"use client";

import { ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { shortenAddress } from "@/lib/chains";
import { Tooltip } from "./Tooltip";
import type { ChainId } from "@/types";
import { CHAINS } from "@/lib/chains";

interface AddressLinkProps {
  address: string;
  chainId: ChainId;
  name?: string | null;
  showFull?: boolean;
}

export function AddressLink({ address, chainId, name, showFull }: AddressLinkProps) {
  const [copied, setCopied] = useState(false);
  const explorer = CHAINS[chainId]?.explorer ?? "https://eth.blockscout.com";
  const href = `${explorer}/address/${address}`;
  const label = name || (showFull ? address : shortenAddress(address));

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span className="inline-flex items-center gap-1.5 group">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-sm text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white underline-offset-2 hover:underline"
      >
        {label}
      </a>
      <Tooltip content={copied ? "Copied" : "Copy address"}>
        <button
          type="button"
          onClick={copy}
          className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          aria-label="Copy address"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </Tooltip>
      <Tooltip content="Open in explorer">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          aria-label="Open in explorer"
        >
          <ExternalLink size={13} />
        </a>
      </Tooltip>
    </span>
  );
}
