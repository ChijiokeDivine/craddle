"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  List,
  AlertCircle,
  GitBranch,
  Layers,
  Link2,
  Check,
} from "lucide-react";
import { SearchForm } from "@/components/SearchForm";
import { ContractList } from "@/components/ContractList";
import { DepsGraph } from "@/components/DepsGraph";
import { AddressLink } from "@/components/AddressLink";
import { Tooltip } from "@/components/Tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExportMenu } from "@/components/ExportMenu";
import type { ChainId, DepsResponse, ViewMode } from "@/types";
import { CHAINS, isValidAddress } from "@/lib/chains";

export function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DepsResponse | null>(null);
  const paramView = searchParams.get("view");
  const [view, setView] = useState<ViewMode>(
    paramView === "list" || paramView === "graph" ? paramView : "list"
  );
  const [linkCopied, setLinkCopied] = useState(false);
  const bootstrapped = useRef(false);

  const syncUrl = useCallback(
    (address: string, chainId: ChainId, viewMode: ViewMode) => {
      const params = new URLSearchParams();
      params.set("address", address);
      params.set("chainId", chainId);
      params.set("view", viewMode);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const handleSearch = useCallback(
    async (address: string, chainId: ChainId, viewMode?: ViewMode) => {
      setLoading(true);
      setError(null);
      setData(null);
      const v = viewMode ?? view;
      syncUrl(address, chainId, v);

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
    },
    [view, syncUrl]
  );

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const addr = searchParams.get("address");
    const chain = (searchParams.get("chainId") || "1") as ChainId;
    const v = (searchParams.get("view") || "list") as ViewMode;

    if (addr && isValidAddress(addr) && CHAINS[chain]) {
      queueMicrotask(() =>
        handleSearch(addr, chain, v === "list" || v === "graph" ? v : "list")
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeView = (v: ViewMode) => {
    setView(v);
    if (data) syncUrl(data.address, data.chainId, v);
  };

  const copyShareLink = async () => {
    if (!data) return;
    const params = new URLSearchParams({
      address: data.address,
      chainId: data.chainId,
      view,
    });
    const url = `${window.location.origin}${window.location.pathname}?${params}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GitBranch
              size={18}
              className="text-zinc-800 dark:text-zinc-100"
              strokeWidth={2}
            />
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12">
        <section className="mb-8">
          <SearchForm
            onSubmit={(a, c) => handleSearch(a, c)}
            loading={loading}
            initialAddress={searchParams.get("address") || ""}
            initialChain={(searchParams.get("chainId") as ChainId) || "1"}
          />
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
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm min-w-0">
                <AddressLink
                  address={data.address}
                  chainId={data.chainId}
                  name={data.center.label || data.center.name}
                  showFull={!data.center.label && !data.center.name}
                />
                {data.center.isProxy && (
                  <Tooltip
                    content={
                      data.center.proxyType
                        ? `Proxy: ${data.center.proxyType}`
                        : "Proxy contract"
                    }
                  >
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
                      <Layers size={12} />
                      proxy
                    </span>
                  </Tooltip>
                )}
                {data.center.implementations[0] && (
                  <span className="text-xs text-zinc-400 font-mono truncate max-w-[160px]">
                    →{" "}
                    {data.center.implementations[0].name ||
                      data.center.implementations[0].address.slice(0, 10)}
                  </span>
                )}
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

              <div className="flex items-center gap-2">
                <ExportMenu data={data} />
                <Tooltip content={linkCopied ? "Copied" : "Copy share link"}>
                  <button
                    type="button"
                    onClick={copyShareLink}
                    className="h-8 w-8 flex items-center justify-center rounded-[8px] border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                    aria-label="Copy share link"
                  >
                    {linkCopied ? <Check size={14} /> : <Link2 size={14} />}
                  </button>
                </Tooltip>
                <div className="inline-flex rounded-[10px] border border-zinc-200 dark:border-zinc-700 p-0.5 bg-white dark:bg-zinc-900">
                  <Tooltip content="List view">
                    <button
                      type="button"
                      onClick={() => changeView("list")}
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
                      onClick={() => changeView("graph")}
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
            </div>

            {data.center.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {data.center.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 rounded-[6px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

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
                center={data.center}
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
