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
import type { ContractNode, ChainId } from "@/types";
import { shortenAddress } from "@/lib/chains";

interface DepsGraphProps {
  centerAddress: string;
  dependsOn: ContractNode[];
  dependsOnIt: ContractNode[];
  chainId: ChainId;
}

function buildGraph(
  center: string,
  outbound: ContractNode[],
  inbound: ContractNode[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: center,
    data: { label: shortenAddress(center, 5) },
    position: { x: 320, y: 220 },
    style: {
      background: "#18181b",
      color: "#fafafa",
      border: "1px solid #27272a",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: 12,
      fontFamily: "ui-monospace, monospace",
      fontWeight: 500,
      width: 150,
      textAlign: "center",
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  });

  const maxOut = Math.min(outbound.length, 12);
  const maxIn = Math.min(inbound.length, 12);

  outbound.slice(0, maxOut).forEach((n, i) => {
    const id = `out-${n.address}`;
    const y = 40 + i * 55;
    nodes.push({
      id,
      data: { label: n.name ? n.name.slice(0, 18) : shortenAddress(n.address, 4) },
      position: { x: 560, y },
      style: {
        background: "var(--card, #fff)",
        color: "var(--foreground, #18181b)",
        border: "1px solid var(--border, #e4e4e7)",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 11,
        fontFamily: "ui-monospace, monospace",
        width: 140,
      },
      sourcePosition: Position.Left,
      targetPosition: Position.Left,
    });
    edges.push({
      id: `e-out-${i}`,
      source: center,
      target: id,
      type: "smoothstep",
      style: { stroke: "#a1a1aa", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#a1a1aa", width: 16, height: 16 },
      label: `${n.txCount}×`,
      labelStyle: { fontSize: 10, fill: "#71717a" },
      labelBgStyle: { fill: "transparent" },
    });
  });

  inbound.slice(0, maxIn).forEach((n, i) => {
    const id = `in-${n.address}`;
    const y = 40 + i * 55;
    nodes.push({
      id,
      data: { label: n.name ? n.name.slice(0, 18) : shortenAddress(n.address, 4) },
      position: { x: 40, y },
      style: {
        background: "var(--card, #fff)",
        color: "var(--foreground, #18181b)",
        border: "1px solid var(--border, #e4e4e7)",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 11,
        fontFamily: "ui-monospace, monospace",
        width: 140,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Right,
    });
    edges.push({
      id: `e-in-${i}`,
      source: id,
      target: center,
      type: "smoothstep",
      style: { stroke: "#a1a1aa", strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#a1a1aa", width: 16, height: 16 },
      label: `${n.txCount}×`,
      labelStyle: { fontSize: 10, fill: "#71717a" },
      labelBgStyle: { fill: "transparent" },
    });
  });

  return { nodes, edges };
}

export function DepsGraph({ centerAddress, dependsOn, dependsOnIt }: DepsGraphProps) {
  const { nodes, edges } = useMemo(
    () => buildGraph(centerAddress.toLowerCase(), dependsOn, dependsOnIt),
    [centerAddress, dependsOn, dependsOnIt]
  );

  const onInit = useCallback((instance: { fitView: (opts?: object) => void }) => {
    instance.fitView({ padding: 0.2 });
  }, []);

  if (dependsOn.length === 0 && dependsOnIt.length === 0) {
    return (
      <div className="flex items-center justify-center h-[420px] text-sm text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700 rounded-[10px] bg-white dark:bg-zinc-900">
        No interactions to graph
      </div>
    );
  }

  return (
    <div className="h-[420px] border border-zinc-200 dark:border-zinc-700 rounded-[10px] overflow-hidden bg-zinc-50 dark:bg-zinc-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onInit={onInit}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        minZoom={0.4}
        maxZoom={1.5}
      >
        <Background color="#a1a1aa" gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => (n.id === centerAddress.toLowerCase() ? "#18181b" : "#d4d4d8")}
          maskColor="rgba(9,9,11,0.5)"
          style={{ borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
}
