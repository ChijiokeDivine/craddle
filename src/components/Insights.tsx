// components/Insights.tsx
import { Layers, ShieldAlert, ShieldCheck } from "lucide-react";
import type { ComponentType } from "react";
import type { DepsResponse } from "@/types";
import { formatWei } from "@/lib/chains";

type Tone = "warn" | "ok" | "info";

interface Insight {
  tone: Tone;
  text: string;
}

const ICONS: Record<Tone, ComponentType<{ size?: number; className?: string }>> = {
  warn: ShieldAlert,
  ok: ShieldCheck,
  info: Layers,
};
const TONE_CLASS: Record<Tone, string> = {
  warn: "text-warn",
  ok: "text-ok",
  info: "text-accent",
};

function sumWei(values: string[]): bigint {
  let total = BigInt(0);
  for (const v of values) {
    try {
      total += BigInt(v);
    } catch {
      /* ignore non-numeric values */
    }
  }
  return total;
}

function buildInsights(data: DepsResponse): Insight[] {
  const out: Insight[] = [];
  const deps = data.dependsOn;

  if (deps.length > 0) {
    const unverified = deps.filter((n) => !n.isVerified);
    if (unverified.length > 0) {
      out.push({
        tone: "warn",
        text: `${unverified.length} of ${deps.length} contracts it depends on aren't verified, so their source can't be read on the explorer.`,
      });
    } else {
      out.push({ tone: "ok", text: `All ${deps.length} contracts it depends on are verified.` });
    }

    const proxies = deps.filter((n) => n.isProxy);
    if (proxies.length > 0) {
      out.push({
        tone: "info",
        text: `${proxies.length} ${proxies.length === 1 ? "dependency is a proxy" : "dependencies are proxies"}, so the code behind ${proxies.length === 1 ? "it" : "them"} can change without the address changing.`,
      });
    }
  }

  if (data.center.isProxy) {
    out.push({
      tone: "info",
      text: "This contract is itself a proxy. Its logic can change without its address changing.",
    });
  }

  if (deps.length === 0 && data.dependsOnIt.length > 0) {
    out.push({
      tone: "info",
      text: "It calls nothing else in the scanned window, so it behaves like a leaf contract.",
    });
  }

  const top = [...deps].sort((a, b) => b.callCount - a.callCount)[0];
  if (top && deps.length > 1) {
    const name = top.label || top.name || `${top.address.slice(0, 10)}…`;
    out.push({
      tone: "info",
      text: `Its most-called dependency is ${name} (${top.callCount}×).`,
    });
  }

  const sent = sumWei(deps.map((n) => n.totalValueWei));
  if (sent > BigInt(0)) {
    out.push({
      tone: "info",
      text: `It sent about Ξ ${formatWei(sent.toString())} of native value to its dependencies in the scanned calls.`,
    });
  }

  return out;
}

interface InsightsProps {
  data: DepsResponse;
}

export function Insights({ data }: InsightsProps) {
  const items = buildInsights(data);
  if (items.length === 0) return null;

  return (
    <section aria-label="Quick read" className="border border-line bg-card">
      <div className="flex items-baseline justify-between border-b border-line px-4 py-2.5">
        <h2 className="text-sm font-semibold">Quick read</h2>
        <span className="font-mono text-[11px] text-muted">
          {`from ${data.stats.scanned} scanned transactions`}
        </span>
      </div>
      <ul className="divide-y divide-line">
        {items.map((it, i) => {
          const Icon = ICONS[it.tone];
          return (
            <li key={i} className="flex items-start gap-3 px-4 py-2.5 text-sm">
              <Icon size={15} className={`mt-0.5 shrink-0 ${TONE_CLASS[it.tone]}`} />
              <span>{it.text}</span>
            </li>
          );
        })}
      </ul>
      <p className="border-t border-line px-4 py-2 text-[11px] text-muted">
        Automatic observations to guide your review. They are not an audit.
      </p>
    </section>
  );
}
