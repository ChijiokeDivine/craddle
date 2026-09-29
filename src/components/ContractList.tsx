"use client";

import { ShieldCheck, FileCode2 } from "lucide-react";
import { AddressLink } from "./AddressLink";
import { Tooltip } from "./Tooltip";
import type { ContractNode, ChainId } from "@/types";

interface ContractListProps {
  title: string;
  items: ContractNode[];
  chainId: ChainId;
  emptyLabel: string;
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
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 text-zinc-400">
                  {node.isVerified ? (
                    <Tooltip content="Verified">
                      <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                    </Tooltip>
                  ) : (
                    <Tooltip content="Contract">
                      <FileCode2 size={14} />
                    </Tooltip>
                  )}
                </span>
                <AddressLink
                  address={node.address}
                  chainId={chainId}
                  name={node.name}
                />
              </div>
              <Tooltip content="Internal calls involving this pair">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums shrink-0">
                  {node.txCount}×
                </span>
              </Tooltip>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
