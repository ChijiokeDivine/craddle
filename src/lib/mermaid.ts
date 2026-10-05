// lib/mermaid.ts
import type { DepsResponse, ContractNode } from "@/types";
import { shortenAddress } from "@/lib/chains";

function clean(s: string): string {
  return s.replace(/["\[\]{}()<>|]/g, "").slice(0, 28);
}

function nodeLabel(n: ContractNode): string {
  return clean(n.label || n.name || shortenAddress(n.address, 4));
}

/** Mermaid flowchart you can paste into docs, READMEs or mermaid.live */
export function toMermaid(data: DepsResponse): string {
  const lines: string[] = ["flowchart LR"];
  const centerLabel = clean(
    data.center.label || data.center.name || shortenAddress(data.address, 5)
  );
  lines.push(`  C["${centerLabel}"]`);

  data.dependsOn.forEach((n, i) => {
    lines.push(`  O${i}["${nodeLabel(n)}"]`);
    lines.push(`  C -->|${n.callCount}x| O${i}`);
  });
  data.dependsOnIt.forEach((n, i) => {
    lines.push(`  I${i}["${nodeLabel(n)}"]`);
    lines.push(`  I${i} -->|${n.callCount}x| C`);
  });

  lines.push("  style C fill:#0000f2,stroke:#00001f,color:#ffffff");
  return lines.join("\n");
}
