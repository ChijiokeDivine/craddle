// components/AddressLink.tsx
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
    <span className="group inline-flex min-w-0 items-center gap-1.5">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 break-all font-mono text-sm text-foreground underline-offset-4 hover:text-accent hover:underline"
      >
        {label}
      </a>
      <Tooltip content={copied ? "Copied" : "Copy address"}>
        <button
          type="button"
          onClick={copy}
          className="p-0.5 text-muted transition-colors hover:text-accent"
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
          className="p-0.5 text-muted transition-colors hover:text-accent"
          aria-label="Open in explorer"
        >
          <ExternalLink size={13} />
        </a>
      </Tooltip>
    </span>
  );
}
