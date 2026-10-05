// components/StatsStrip.tsx
import type { DepsResponse } from "@/types";

interface StatsStripProps {
  data: DepsResponse;
}

export function StatsStrip({ data }: StatsStripProps) {
  const unique = new Map<string, { verified: boolean; proxy: boolean }>();
  for (const n of [...data.dependsOn, ...data.dependsOnIt]) {
    unique.set(n.address.toLowerCase(), {
      verified: n.isVerified,
      proxy: n.isProxy,
    });
  }
  const total = unique.size;
  const verified = [...unique.values()].filter((v) => v.verified).length;
  const proxies = [...unique.values()].filter((v) => v.proxy).length;
  const pct = total === 0 ? null : Math.round((verified / total) * 100);

  const cells: { label: string; value: string; hint: string }[] = [
    { label: "Depends on", value: String(data.stats.outbound), hint: "contracts it calls" },
    { label: "Used by", value: String(data.stats.inbound), hint: "contracts that call it" },
    {
      label: "Verified",
      value: pct === null ? "n/a" : `${pct}%`,
      hint: pct === null ? "no counterparties" : `${verified} of ${total} counterparties`,
    },
    { label: "Proxies", value: String(proxies), hint: "upgradeable counterparties" },
    { label: "Scanned", value: String(data.stats.scanned), hint: "internal transactions" },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
      {cells.map((c) => (
        <div key={c.label} className="bg-card px-4 py-3">
          <dt className="text-xs text-muted">{c.label}</dt>
          <dd className="mt-1 font-mono text-2xl font-medium tabular-nums">{c.value}</dd>
          <dd className="mt-0.5 text-[11px] text-muted">{c.hint}</dd>
        </div>
      ))}
    </dl>
  );
}
