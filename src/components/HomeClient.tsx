// components/HomeClient.tsx
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, AlertCircle, Link2, Check, RotateCw } from "lucide-react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { StatsStrip } from "@/components/StatsStrip";
import { Insights } from "@/components/Insights";
import { ApiSnippet } from "@/components/ApiSnippet";
import { ExploreTrail, type TrailEntry } from "@/components/ExploreTrail";
import { ContractList } from "@/components/ContractList";
import { DepsGraph } from "@/components/DepsGraph";
import { AddressLink } from "@/components/AddressLink";
import { Tooltip } from "@/components/Tooltip";
import { Pill } from "@/components/Pill";
import { ExportMenu } from "@/components/ExportMenu";
import type { ChainId, DepsResponse, ViewMode } from "@/types";
import { CHAINS, isValidAddress, shortenAddress } from "@/lib/chains";
import { clearRecent, loadRecent, saveRecent, type RecentSearch } from "@/lib/history";

type TrailMode = "reset" | "push" | "keep";

const outlineBtn =
  "inline-flex h-9 items-center gap-1.5 border border-line bg-card px-3 text-sm transition-colors hover:border-accent hover:text-accent";

export function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DepsResponse | null>(null);
  const [cacheHit, setCacheHit] = useState(false);
  const paramView = searchParams.get("view");
  const [view, setView] = useState<ViewMode>(
    paramView === "list" || paramView === "graph" ? paramView : "list"
  );
  const [linkCopied, setLinkCopied] = useState(false);
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const [trail, setTrail] = useState<TrailEntry[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const bootstrapped = useRef(false);
  const reqId = useRef(0);
  const lastQuery = useRef<{ address: string; chainId: ChainId } | null>(null);

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
    async (
      address: string,
      chainId: ChainId,
      viewMode?: ViewMode,
      trailMode: TrailMode = "reset"
    ) => {
      const id = ++reqId.current;
      const v = viewMode ?? view;
      const addr = address.toLowerCase();
      lastQuery.current = { address, chainId };

      setLoading(true);
      setError(null);
      setData(null);
      setCacheHit(false);
      syncUrl(address, chainId, v);

      setTrail((prev) => {
        if (trailMode === "keep") return prev;
        const entry: TrailEntry = { address: addr, chainId };
        if (trailMode === "reset") return [entry];
        const last = prev[prev.length - 1];
        if (last && last.address === addr && last.chainId === chainId) return prev;
        return [...prev, entry].slice(-8);
      });

      try {
        const res = await fetch(
          `/api/deps?address=${encodeURIComponent(address)}&chainId=${chainId}`
        );
        const json = await res.json();
        if (id !== reqId.current) return;

        if (!res.ok) {
          setError(json.error || "Request failed");
          return;
        }

        const body = json as DepsResponse;
        const name = body.center.label || body.center.name;
        setData(body);
        setCacheHit(res.headers.get("X-Cache") === "HIT");
        if (name) setNames((prev) => ({ ...prev, [`${chainId}:${addr}`]: name }));
        setRecent(saveRecent({ address: addr, chainId, name }));
      } catch {
        if (id === reqId.current) setError("Network error. Please try again.");
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    },
    [view, syncUrl]
  );

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    queueMicrotask(() => setRecent(loadRecent()));

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

  useEffect(() => {
    const name = data?.center.label || data?.center.name;
    document.title = data
      ? `${name ?? shortenAddress(data.address, 4)} on craddle`
      : "craddle — Contract Dependency Explorer";
  }, [data]);

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

  const explore = useCallback(
    (address: string) => {
      if (!data) return;
      window.scrollTo({ top: 0, behavior: "smooth" });
      handleSearch(address, data.chainId, view, "push");
    },
    [data, view, handleSearch]
  );

  const jumpTo = useCallback(
    (index: number) => {
      const entry = trail[index];
      if (!entry) return;
      setTrail(trail.slice(0, index + 1));
      handleSearch(entry.address, entry.chainId as ChainId, view, "keep");
    },
    [trail, view, handleSearch]
  );

  const handleClearRecent = () => {
    clearRecent();
    setRecent([]);
  };

  const trailWithLabels: TrailEntry[] = trail.map((t) => ({
    ...t,
    label: names[`${t.chainId}:${t.address}`],
  }));

  const centerName = data ? data.center.label || data.center.name : null;
  const compact = loading || !!data || !!error;

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <Hero
        compact={compact}
        loading={loading}
        initialAddress={searchParams.get("address") || ""}
        initialChain={(searchParams.get("chainId") as ChainId) || "1"}
        recent={recent}
        onSubmit={(a, c) => handleSearch(a, c)}
        onClearRecent={handleClearRecent}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
        {loading && (
          <div className="space-y-6" aria-live="polite" aria-busy="true">
            <p className="font-mono text-sm text-muted">
              {"// scanning internal transactions"}
              <span className="cursor-blink">_</span>
            </p>
            <div className="grid animate-pulse grid-cols-2 gap-px border border-line bg-line sm:grid-cols-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-card" />
              ))}
            </div>
            <div className="grid animate-pulse grid-cols-1 gap-6 md:grid-cols-2">
              <div className="h-64 border border-line bg-subtle" />
              <div className="h-64 border border-line bg-subtle" />
            </div>
          </div>
        )}

        {error && !loading && (
          <div role="alert" className="border border-line border-l-4 border-l-bad bg-card px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-bad" />
              <div className="min-w-0">
                <p className="font-semibold">Couldn&apos;t load this contract</p>
                <p className="mt-1 break-words text-sm text-muted">{error}</p>
                <p className="mt-2 text-sm">
                  Check the address and the selected chain, then try again.
                </p>
                {lastQuery.current && (
                  <button
                    type="button"
                    onClick={() =>
                      lastQuery.current &&
                      handleSearch(lastQuery.current.address, lastQuery.current.chainId)
                    }
                    className={`${outlineBtn} mt-3`}
                  >
                    <RotateCw size={14} />
                    Try again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6">
            <ExploreTrail trail={trailWithLabels} onJump={jumpTo} />

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="break-words text-3xl font-bold tracking-tight sm:text-4xl">
                  {centerName || "Unnamed contract"}
                </h2>
                <div className="mt-2">
                  <AddressLink address={data.address} chainId={data.chainId} showFull />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Pill colons tone="accent">
                    {(CHAINS[data.chainId]?.name ?? data.chainId).toLowerCase()}
                  </Pill>
                  {data.center.isProxy && (
                    <Tooltip
                      content={
                        data.center.proxyType
                          ? `Proxy: ${data.center.proxyType}`
                          : "Proxy contract"
                      }
                    >
                      <Pill colons tone="warn">
                        proxy
                      </Pill>
                    </Tooltip>
                  )}
                  {data.center.isVerified && (
                    <Pill colons tone="ok">
                      verified
                    </Pill>
                  )}
                  {cacheHit && (
                    <Tooltip content="Served from cache, up to 5 minutes old">
                      <Pill colons>cached</Pill>
                    </Tooltip>
                  )}
                  {data.center.implementations[0] && (
                    <span className="max-w-[220px] truncate font-mono text-xs text-muted">
                      →{" "}
                      {data.center.implementations[0].name ||
                        data.center.implementations[0].address.slice(0, 10)}
                    </span>
                  )}
                  {data.center.tags.map((t) => (
                    <Pill key={t}>{t}</Pill>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ExportMenu data={data} />
                <button type="button" onClick={copyShareLink} className={outlineBtn}>
                  {linkCopied ? <Check size={14} /> : <Link2 size={14} />}
                  {linkCopied ? "Copied" : "Copy link"}
                </button>
                <div
                  className="inline-flex border border-line bg-card p-0.5"
                  role="group"
                  aria-label="View mode"
                >
                  {(
                    [
                      { key: "list", label: "List", Icon: List },
                      { key: "graph", label: "Graph", Icon: LayoutGrid },
                    ] as const
                  ).map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => changeView(key)}
                      aria-pressed={view === key}
                      className={`inline-flex h-8 items-center gap-1.5 px-3 text-sm transition-colors ${
                        view === key
                          ? "bg-brand text-brand-ink"
                          : "text-muted hover:text-accent"
                      }`}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <StatsStrip data={data} />
            <Insights data={data} />

            {view === "list" ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <ContractList
                  title="Depends on"
                  hint="Contracts this one calls"
                  items={data.dependsOn}
                  chainId={data.chainId}
                  emptyLabel="No outbound calls found"
                  onExplore={explore}
                />
                <ContractList
                  title="Used by"
                  hint="Contracts that call this one"
                  items={data.dependsOnIt}
                  chainId={data.chainId}
                  emptyLabel="No inbound calls found"
                  onExplore={explore}
                />
              </div>
            ) : (
              <DepsGraph
                centerAddress={data.address}
                center={data.center}
                dependsOn={data.dependsOn}
                dependsOnIt={data.dependsOnIt}
                chainId={data.chainId}
                onExplore={explore}
              />
            )}

            <ApiSnippet address={data.address} chainId={data.chainId} />
          </div>
        )}

        {!data && !loading && !error && <Features />}
      </main>

      <Footer />
    </div>
  );
}
