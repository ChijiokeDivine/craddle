import type { DepsResponse, ContractNode, ChainId } from "@/types";
import { CHAINS } from "@/lib/chains";

function nodeLabel(n: ContractNode): string {
  return n.label || n.name || n.address;
}

function edgeRows(data: DepsResponse) {
  const rows: Array<{
    direction: string;
    source: string;
    source_label: string;
    target: string;
    target_label: string;
    call_count: number;
    total_value_wei: string;
    first_block: number | null;
    last_block: number | null;
    first_timestamp: string | null;
    last_timestamp: string | null;
    is_proxy: boolean;
    proxy_type: string | null;
    implementations: string;
    tags: string;
  }> = [];

  for (const n of data.dependsOn) {
    rows.push({
      direction: "outbound",
      source: data.address,
      source_label: data.center.label || data.center.name || data.address,
      target: n.address,
      target_label: nodeLabel(n),
      call_count: n.callCount,
      total_value_wei: n.totalValueWei,
      first_block: n.firstBlock,
      last_block: n.lastBlock,
      first_timestamp: n.firstTimestamp,
      last_timestamp: n.lastTimestamp,
      is_proxy: n.isProxy,
      proxy_type: n.proxyType,
      implementations: n.implementations.map((i) => i.address).join(";"),
      tags: n.tags.join(";"),
    });
  }

  for (const n of data.dependsOnIt) {
    rows.push({
      direction: "inbound",
      source: n.address,
      source_label: nodeLabel(n),
      target: data.address,
      target_label: data.center.label || data.center.name || data.address,
      call_count: n.callCount,
      total_value_wei: n.totalValueWei,
      first_block: n.firstBlock,
      last_block: n.lastBlock,
      first_timestamp: n.firstTimestamp,
      last_timestamp: n.lastTimestamp,
      is_proxy: n.isProxy,
      proxy_type: n.proxyType,
      implementations: n.implementations.map((i) => i.address).join(";"),
      tags: n.tags.join(";"),
    });
  }

  return rows;
}

export function toJSON(data: DepsResponse): string {
  return JSON.stringify(
    {
      ...data,
      chain: CHAINS[data.chainId as ChainId]?.name,
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

export function toCSV(data: DepsResponse): string {
  const rows = edgeRows(data);
  const headers = [
    "direction",
    "source",
    "source_label",
    "target",
    "target_label",
    "call_count",
    "total_value_wei",
    "first_block",
    "last_block",
    "first_timestamp",
    "last_timestamp",
    "is_proxy",
    "proxy_type",
    "implementations",
    "tags",
  ];

  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      headers.map((h) => escape((r as Record<string, unknown>)[h])).join(",")
    );
  }
  return lines.join("\n");
}

export function toDOT(data: DepsResponse): string {
  const lines = ["digraph craddle {", "  rankdir=LR;", '  node [shape=box, style=rounded, fontname="monospace"];'];
  const center = data.address;
  const cLabel = (data.center.label || data.center.name || center).replace(/"/g, '\\"');
  lines.push(`  "${center}" [label="${cLabel}\\n${center.slice(0, 10)}…", style="rounded,filled", fillcolor="#18181b", fontcolor="#fafafa"];`);

  for (const n of data.dependsOn) {
    const lbl = nodeLabel(n).replace(/"/g, '\\"');
    lines.push(`  "${n.address}" [label="${lbl}\\n${n.callCount}x"];`);
    lines.push(`  "${center}" -> "${n.address}" [label="${n.callCount}"];`);
  }
  for (const n of data.dependsOnIt) {
    const lbl = nodeLabel(n).replace(/"/g, '\\"');
    lines.push(`  "${n.address}" [label="${lbl}\\n${n.callCount}x"];`);
    lines.push(`  "${n.address}" -> "${center}" [label="${n.callCount}"];`);
  }
  lines.push("}");
  return lines.join("\n");
}

export function toGraphML(data: DepsResponse): string {
  const nodes = new Map<string, string>();
  nodes.set(data.address, data.center.label || data.center.name || data.address);
  for (const n of [...data.dependsOn, ...data.dependsOnIt]) {
    nodes.set(n.address, nodeLabel(n));
  }

  const parts: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">',
    '  <key id="label" for="node" attr.name="label" attr.type="string"/>',
    '  <key id="calls" for="edge" attr.name="call_count" attr.type="int"/>',
    '  <key id="value" for="edge" attr.name="total_value_wei" attr.type="string"/>',
    '  <graph id="G" edgedefault="directed">',
  ];

  for (const [id, label] of nodes) {
    parts.push(`    <node id="${id}"><data key="label">${escapeXml(label)}</data></node>`);
  }

  let ei = 0;
  for (const n of data.dependsOn) {
    parts.push(
      `    <edge id="e${ei++}" source="${data.address}" target="${n.address}">` +
        `<data key="calls">${n.callCount}</data>` +
        `<data key="value">${n.totalValueWei}</data></edge>`
    );
  }
  for (const n of data.dependsOnIt) {
    parts.push(
      `    <edge id="e${ei++}" source="${n.address}" target="${data.address}">` +
        `<data key="calls">${n.callCount}</data>` +
        `<data key="value">${n.totalValueWei}</data></edge>`
    );
  }

  parts.push("  </graph>", "</graphml>");
  return parts.join("\n");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
