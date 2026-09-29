"use client";

import { ShieldCheck, FileCode2, Layers } from "lucide-react";
import { AddressLink } from "./AddressLink";
import { Tooltip } from "./Tooltip";
import type { ContractNode, ChainId } from "@/types";
import { formatWei } from "@/lib/chains";

interface ContractListProps {
  title: string;
  items: ContractNode[];
  chainId: ChainId;
  emptyLabel: string;
}

function formatTs(ts: string | null): string {
  if (!ts) return "—";
  try {
    return new Date(ts).toISOString().slice(0, 10);
  } catch {
    return ts.slice(0, 10);
  }
}

export function ContractList({ title, items, chainId, emptyLabel }: ContractListProps) {
  return (
    <div className="flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 tracking-wide uppercase">
          {title}
        </h2>
        <span className="text-xs text-zinc-400 tabular-nums">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 py-6 text-center">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[10px] overflow-hidden bg-white dark:bg-zinc-900">
          {items.map((node) => (
            <li
              key={node.address}
              className="px-3.5 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="shrink-0 text-zinc-400 mt-0.5">
                    {node.isProxy ? (
                      <Tooltip content={node.proxyType ? `Proxy (${node.proxyType})` : "Proxy"}>
                        <Layers size={14} className="text-amber-600 dark:text-amber-400" />
                      </Tooltip>
                    ) : node.isVerified ? (
                      <Tooltip content="Verified">
                        <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                      </Tooltip>
                    ) : (
                      <Tooltip content="Contract">
                        <FileCode2 size={14} />
                      </Tooltip>
                    )}
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <AddressLink
                      address={node.address}
                      chainId={chainId}
                      name={node.label || node.name}
                    />
                    {node.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {node.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="inline-block text-[10px] px-1.5 py-0.5 rounded-[6px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {node.implementations.length > 0 && (
                      <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono truncate">
                        impl: {node.implementations[0].name || node.implementations[0].address.slice(0, 10)}…
                        {node.implementations.length > 1 && ` +${node.implementations.length - 1}`}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right space-y-0.5">
                  <Tooltip content="Internal call count">
                    <span className="text-xs text-zinc-700 dark:text-zinc-300 tabular-nums font-medium block">
                      {node.callCount}×
                    </span>
                  </Tooltip>
                  {node.totalValueWei !== "0" && (
                    <Tooltip content="Native value transferred (approx)">
                      <span className="text-[10px] text-zinc-400 tabular-nums block">
                        Ξ {formatWei(node.totalValueWei)}
                      </span>
                    </Tooltip>
                  )}
                  <Tooltip content={`First → last seen`}>
                    <span className="text-[10px] text-zinc-400 tabular-nums block">
                      {formatTs(node.firstTimestamp)} → {formatTs(node.lastTimestamp)}
                    </span>
                  </Tooltip>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
