"use client";

import { useState, useCallback } from "react";
import { LayoutGrid, List, AlertCircle, GitBranch } from "lucide-react";
import { SearchForm } from "@/components/SearchForm";
import { ContractList } from "@/components/ContractList";
import { DepsGraph } from "@/components/DepsGraph";
import { AddressLink } from "@/components/AddressLink";
import { Tooltip } from "@/components/Tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { ChainId, DepsResponse } from "@/types";
import { CHAINS } from "@/lib/chains";

type ViewMode = "list" | "graph";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DepsResponse | null>(null);
  const [view, setView] = useState<ViewMode>("list");

  const handleSearch = useCallback(async (address: string, chainId: ChainId) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(
        `/api/deps?address=${encodeURIComponent(address)}&chainId=${chainId}`
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Request failed");
        return;
      }

      setData(json as DepsResponse);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GitBranch size={18} className="text-zinc-800 dark:text-zinc-100" strokeWidth={2} />
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              craddle
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 hidden sm:block">
              Contract dependency explorer
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12">
        <section className="mb-8">
          <SearchForm onSubmit={handleSearch} loading={loading} />
        </section>

        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-5 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-[8px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-[10px]" />
              <div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-[10px]" />
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-start gap-3 rounded-[10px] border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <AddressLink
                  address={data.address}
                  chainId={data.chainId}
                  showFull
                />
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  {CHAINS[data.chainId]?.name}
                </span>
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <Tooltip content="Internal transactions scanned">
                  <span className="text-zinc-500 dark:text-zinc-400 tabular-nums cursor-default">
                    {data.stats.scanned} scanned
                  </span>
                </Tooltip>
              </div>

              <div className="inline-flex rounded-[10px] border border-zinc-200 dark:border-zinc-700 p-0.5 bg-white dark:bg-zinc-900">
                <Tooltip content="List view">
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className={`h-8 w-8 flex items-center justify-center rounded-[8px] transition-colors ${
                      view === "list"
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                        : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                    aria-label="List view"
                  >
                    <List size={15} />
                  </button>
                </Tooltip>
                <Tooltip content="Graph view">
                  <button
                    type="button"
                    onClick={() => setView("graph")}
                    className={`h-8 w-8 flex items-center justify-center rounded-[8px] transition-colors ${
                      view === "graph"
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                        : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                    aria-label="Graph view"
                  >
                    <LayoutGrid size={15} />
                  </button>
                </Tooltip>
              </div>
            </div>

            {view === "list" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ContractList
                  title="Depends on"
                  items={data.dependsOn}
                  chainId={data.chainId}
                  emptyLabel="No outbound calls found"
                />
                <ContractList
                  title="Depends on it"
                  items={data.dependsOnIt}
                  chainId={data.chainId}
                  emptyLabel="No inbound calls found"
                />
              </div>
            ) : (
              <DepsGraph
                centerAddress={data.address}
                dependsOn={data.dependsOn}
                dependsOnIt={data.dependsOnIt}
                chainId={data.chainId}
              />
            )}
          </div>
        )}

        {!data && !loading && !error && (
          <div className="text-center py-16 text-sm text-zinc-400 dark:text-zinc-500">
            Paste a contract address to explore its dependencies
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-4">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <span>Powered by Blockscout</span>
          <span>craddle</span>
        </div>
      </footer>
    </div>
  );
}
