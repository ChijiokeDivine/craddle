// components/ContractList.tsx
"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, FileCode2, Layers, ArrowUpRight, Search } from "lucide-react";
import { AddressLink } from "./AddressLink";
import { Tooltip } from "./Tooltip";
import { Pill } from "./Pill";
import type { ContractNode, ChainId } from "@/types";
import { formatWei } from "@/lib/chains";

interface ContractListProps {
  title: string;
  hint: string;
  items: ContractNode[];
  chainId: ChainId;
  emptyLabel: string;
  /** Re-centre the explorer on a contract from this list */
  onExplore?: (address: string) => void;
}

type SortKey = "calls" | "recent" | "value" | "name";
type FilterKey = "all" | "verified" | "unverified" | "proxy";

const PAGE_SIZE = 8;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "verified", label: "Verified" },
  { key: "unverified", label: "Unverified" },
  { key: "proxy", label: "Proxies" },
];

function formatTs(ts: string | null): string {
  if (!ts) return "—";
  try {
    return new Date(ts).toISOString().slice(0, 10);
  } catch {
    return ts.slice(0, 10);
  }
}

function big(v: string): bigint {
  try {
    return BigInt(v);
  } catch {
    return BigInt(0);
  }
}

function displayName(n: ContractNode): string {
  return (n.label || n.name || n.address).toLowerCase();
}

export function ContractList({
  title,
  hint,
  items,
  chainId,
  emptyLabel,
  onExplore,
}: ContractListProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("calls");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const showControls = items.length > 4;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((n) => {
      if (filter === "verified" && !n.isVerified) return false;
      if (filter === "unverified" && n.isVerified) return false;
      if (filter === "proxy" && !n.isProxy) return false;
      if (!q) return true;
      return (
        n.address.toLowerCase().includes(q) ||
        (n.name ?? "").toLowerCase().includes(q) ||
        (n.label ?? "").toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sort) {
        case "recent":
          return (Date.parse(b.lastTimestamp ?? "") || 0) - (Date.parse(a.lastTimestamp ?? "") || 0);
        case "value": {
          const av = big(a.totalValueWei);
          const bv = big(b.totalValueWei);
          return av > bv ? -1 : av < bv ? 1 : 0;
        }
        case "name":
          return displayName(a).localeCompare(displayName(b));
        default:
          return b.callCount - a.callCount;
      }
    });
    return sorted;
  }, [items, query, sort, filter]);

  const clearFilters = () => {
    setQuery("");
    setFilter("all");
  };

  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold leading-tight">{title}</h2>
          <p className="text-xs text-muted">{hint}</p>
        </div>
        <Pill colons tone="accent">
          {items.length}
        </Pill>
      </div>

      {showControls && (
        <div className="mb-3 space-y-2">
          <div className="flex gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Filter {title}</span>
              <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisible(PAGE_SIZE);
                }}
                placeholder="Filter by name, tag or address"
                className="h-8 w-full border border-line bg-card pl-8 pr-2 text-xs placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-8 border border-line bg-card px-2 text-xs focus:border-accent focus:outline-none"
              aria-label="Sort order"
            >
              <option value="calls">Most calls</option>
              <option value="recent">Most recent</option>
              <option value="value">Highest value</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setFilter(f.key);
                  setVisible(PAGE_SIZE);
                }}
                aria-pressed={filter === f.key}
                className={`border px-2 py-0.5 font-mono text-[11px] transition-colors ${
                  filter === f.key
                    ? "border-brand bg-brand text-brand-ink"
                    : "border-line text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
          {emptyLabel}
        </p>
      ) : shown.length === 0 ? (
        <div className="border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
          No contracts match.{" "}
          <button type="button" onClick={clearFilters} className="text-accent underline underline-offset-4">
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-line border border-line bg-card">
            {shown.slice(0, visible).map((node) => {
              const stripe = node.isProxy
                ? "border-l-warn"
                : node.isVerified
                  ? "border-l-accent"
                  : "border-l-line";
              return (
                <li
                  key={node.address}
                  className={`border-l-[3px] px-3.5 py-3 transition-colors hover:bg-subtle ${stripe}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-muted">
                        {node.isProxy ? (
                          <Tooltip content={node.proxyType ? `Proxy (${node.proxyType})` : "Proxy"}>
                            <Layers size={14} className="text-warn" />
                          </Tooltip>
                        ) : node.isVerified ? (
                          <Tooltip content="Verified">
                            <ShieldCheck size={14} className="text-accent" />
                          </Tooltip>
                        ) : (
                          <Tooltip content="Unverified contract">
                            <FileCode2 size={14} />
                          </Tooltip>
                        )}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <AddressLink address={node.address} chainId={chainId} name={node.label || node.name} />
                        {node.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {node.tags.slice(0, 3).map((t) => (
                              <Pill key={t}>{t}</Pill>
                            ))}
                          </div>
                        )}
                        {node.implementations.length > 0 && (
                          <div className="truncate font-mono text-[11px] text-muted">
                            impl: {node.implementations[0].name || node.implementations[0].address.slice(0, 10)}…
                            {node.implementations.length > 1 && ` +${node.implementations.length - 1}`}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 space-y-0.5 text-right">
                      <Tooltip content="Internal call count">
                        <span className="block font-mono text-sm font-medium tabular-nums">{node.callCount}×</span>
                      </Tooltip>
                      {node.totalValueWei !== "0" && (
                        <Tooltip content="Native value transferred (approx)">
                          <span className="block font-mono text-[11px] tabular-nums text-muted">
                            Ξ {formatWei(node.totalValueWei)}
                          </span>
                        </Tooltip>
                      )}
                      <Tooltip content="First → last seen">
                        <span className="block font-mono text-[11px] tabular-nums text-muted">
                          {formatTs(node.firstTimestamp)} → {formatTs(node.lastTimestamp)}
                        </span>
                      </Tooltip>
                    </div>
                  </div>

                  {onExplore && (
                    <div className="mt-2 pl-[22px]">
                      <button
                        type="button"
                        onClick={() => onExplore(node.address)}
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-accent hover:underline underline-offset-4"
                      >
                        Explore this contract
                        <ArrowUpRight size={12} />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-muted">
            <span>
              {shown.length === items.length
                ? `${shown.length} shown`
                : `${shown.length} of ${items.length} match`}
            </span>
            {visible < shown.length && (
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="border border-line px-2 py-1 text-foreground hover:border-accent hover:text-accent"
              >
                Show {Math.min(PAGE_SIZE, shown.length - visible)} more
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
