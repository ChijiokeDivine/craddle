// components/Features.tsx
import { Pill } from "./Pill";
import { CHAIN_LIST } from "@/lib/chains";

const STEPS = [
  {
    title: "Paste",
    body: "Drop in any contract address and pick the chain it lives on.",
  },
  {
    title: "Read",
    body: "craddle scans its internal transactions and sorts every counterparty into what it calls and what calls it.",
  },
  {
    title: "Explore",
    body: "Double-click a node or press Explore on a row to re-centre on that contract and follow the wiring outward.",
  },
];

const CAPABILITIES = [
  { tag: "proxy-aware", body: "Proxies and their implementations are flagged, so upgradeable code stands out." },
  { tag: "verified", body: "See at a glance which dependencies have readable source on the explorer." },
  { tag: "exports", body: "Take the graph with you as CSV, JSON, GraphML, DOT or Mermaid." },
  { tag: "shareable", body: "Every search has its own link, and every result is available over a plain JSON API." },
];

export function Features() {
  return (
    <div className="space-y-14">
      <section aria-labelledby="steps-title">
        <h2 id="steps-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
          From address to dependency map in three steps
        </h2>
        <ol className="mt-6 grid gap-px border border-line bg-line md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-card p-5">
              <span className="font-mono text-sm text-accent">#{i + 1}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="caps-title">
        <h2 id="caps-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
          Built for reading unfamiliar contracts
        </h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2">
          {CAPABILITIES.map((c) => (
            <li key={c.tag} className="border-l-2 border-accent pl-4">
              <Pill colons tone="accent">
                {c.tag}
              </Pill>
              <p className="mt-2 max-w-md text-sm leading-relaxed">{c.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="chains-title">
        <h2 id="chains-title" className="font-mono text-sm text-muted">
          {"// supported chains"}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {CHAIN_LIST.map((c) => (
            <Pill key={c.id} colons>
              {c.name.toLowerCase()}
            </Pill>
          ))}
        </div>
      </section>
    </div>
  );
}
