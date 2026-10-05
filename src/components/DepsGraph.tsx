// components/DepsGraph.tsx
"use client";

import { useMemo, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import type { ContractNode, ChainId, CenterContract } from "@/types";
import { shortenAddress } from "@/lib/chains";

interface DepsGraphProps {
  centerAddress: string;
  center?: CenterContract;
  dependsOn: ContractNode[];
  dependsOnIt: ContractNode[];
  chainId: ChainId;
  /** Double-clicking a node re-centres the explorer on it */
  onExplore?: (address: string) => void;
}

const MAX_PER_SIDE = 12;
const ROW = 58;

function nodeTitle(n: ContractNode): string {
  const base = n.label || n.name;
  const title = base ? base.slice(0, 18) : shortenAddress(n.address, 4);
  const glyph = n.isProxy ? "◇ " : n.isVerified ? "✓ " : "";
  return `${glyph}${title}`;
}

const sideNodeStyle = {
  background: "var(--card)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  padding: "8px 12px",
  fontSize: 11,
  fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
  width: 150,
  whiteSpace: "pre-line" as const,
  textAlign: "center" as const,
};

function buildGraph(
  center: string,
  centerMeta: CenterContract | undefined,
  outbound: ContractNode[],
  inbound: ContractNode[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const byCalls = (a: ContractNode, b: ContractNode) => b.callCount - a.callCount;
  const outList = [...outbound].sort(byCalls).slice(0, MAX_PER_SIDE);
  const inList = [...inbound].sort(byCalls).slice(0, MAX_PER_SIDE);
  const rows = Math.max(outList.length, inList.length, 1);
  const colHeight = rows * ROW;
  const centerY = 40 + (colHeight - ROW) / 2;

  const centerLabel =
    centerMeta?.label || centerMeta?.name || shortenAddress(center, 5);

  nodes.push({
    id: center,
    data: { label: centerLabel },
    position: { x: 330, y: centerY },
    style: {
      background: "#0000f2",
      color: "#f2f3ff",
      border: "2px solid #00001f",
      borderRadius: 0,
      padding: "10px 14px",
      fontSize: 12,
      fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
      fontWeight: 700,
      width: 160,
      textAlign: "center",
      boxShadow: "4px 4px 0 0 #00001f",
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  });

  const offset = (count: number) => 40 + ((rows - count) * ROW) / 2;

  outList.forEach((n, i) => {
    const id = `out-${n.address}`;
    nodes.push({
      id,
      data: { label: `${nodeTitle(n)}\n${n.callCount}×` },
      position: { x: 600, y: offset(outList.length) + i * ROW },
      style: sideNodeStyle,
      sourcePosition: Position.Left,
      targetPosition: Position.Left,
    });
    edges.push({
      id: `e-out-${i}`,
      source: center,
      target: id,
      type: "smoothstep",
      style: { stroke: "#5b5bff", strokeWidth: 1.75 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#5b5bff", width: 16, height: 16 },
      label: `${n.callCount}×`,
      labelStyle: { fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-jetbrains), monospace" },
      labelBgStyle: { fill: "var(--card)" },
      labelBgPadding: [3, 2],
    });
  });

  inList.forEach((n, i) => {
    const id = `in-${n.address}`;
    nodes.push({
      id,
      data: { label: `${nodeTitle(n)}\n${n.callCount}×` },
      position: { x: 40, y: offset(inList.length) + i * ROW },
      style: sideNodeStyle,
      sourcePosition: Position.Right,
      targetPosition: Position.Right,
    });
    edges.push({
      id: `e-in-${i}`,
      source: id,
      target: center,
      type: "smoothstep",
      style: { stroke: "#9a9ed8", strokeWidth: 1.5, strokeDasharray: "5 4" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#9a9ed8", width: 16, height: 16 },
      label: `${n.callCount}×`,
      labelStyle: { fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-jetbrains), monospace" },
      labelBgStyle: { fill: "var(--card)" },
      labelBgPadding: [3, 2],
    });
  });

  return { nodes, edges };
}

function LegendItem({ children, swatch }: { children: React.ReactNode; swatch: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {swatch}
      {children}
    </span>
  );
}

export function DepsGraph({
  centerAddress,
  center,
  dependsOn,
  dependsOnIt,
  onExplore,
}: DepsGraphProps) {
  const { nodes, edges } = useMemo(
    () => buildGraph(centerAddress.toLowerCase(), center, dependsOn, dependsOnIt),
    [centerAddress, center, dependsOn, dependsOnIt]
  );

  const onInit = useCallback((instance: { fitView: (opts?: object) => void }) => {
    instance.fitView({ padding: 0.2 });
  }, []);

  const centerId = centerAddress.toLowerCase();

  if (dependsOn.length === 0 && dependsOnIt.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center border border-line bg-card text-sm text-muted">
        No interactions to graph
      </div>
    );
  }

  const hiddenOut = Math.max(0, dependsOn.length - MAX_PER_SIDE);
  const hiddenIn = Math.max(0, dependsOnIt.length - MAX_PER_SIDE);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 font-mono text-[11px] text-muted">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <LegendItem swatch={<span className="inline-block h-2.5 w-2.5 bg-brand" />}>this contract</LegendItem>
          <LegendItem swatch={<span className="inline-block w-5 border-t-2 border-[#5b5bff]" />}>depends on</LegendItem>
          <LegendItem swatch={<span className="inline-block w-5 border-t-2 border-dashed border-[#9a9ed8]" />}>used by</LegendItem>
          <span>✓ verified</span>
          <span>◇ proxy</span>
        </div>
        {onExplore && <span>{"// double-click a node to explore it"}</span>}
      </div>

      <div className="h-[480px] overflow-hidden border border-line bg-subtle">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onInit={onInit}
          onNodeDoubleClick={(_, node) => {
            if (!onExplore || node.id === centerId) return;
            onExplore(node.id.replace(/^(out|in)-/, ""));
          }}
          fitView
          proOptions={{ hideAttribution: true }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          zoomOnDoubleClick={false}
          minZoom={0.3}
          maxZoom={1.5}
        >
          <Background color="#8a8ad0" gap={22} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n) => (n.id === centerId ? "#0000f2" : "#9a9ed8")}
            maskColor="rgba(3,3,26,0.45)"
          />
        </ReactFlow>
      </div>

      {(hiddenOut > 0 || hiddenIn > 0) && (
        <p className="mt-2 font-mono text-[11px] text-muted">
          {`// graph shows the top ${MAX_PER_SIDE} per side by call count`}
          {hiddenOut > 0 && `, ${hiddenOut} more dependencies in list view`}
          {hiddenIn > 0 && `, ${hiddenIn} more callers in list view`}
        </p>
      )}
    </div>
  );
}
