"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Copy, Check, ChevronDown } from "lucide-react";
import type { DepsResponse } from "@/types";
import { toCSV, toJSON, toDOT, toGraphML, downloadText } from "@/lib/export";
import { Tooltip } from "./Tooltip";

interface ExportMenuProps {
  data: DepsResponse;
}

export function ExportMenu({ data }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const short = data.address.slice(0, 10);
  const base = `craddle-${short}-${data.chainId}`;

  const copy = async (kind: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="relative" ref={ref}>
      <Tooltip content="Export graph data">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-[8px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <Download size={13} />
          Export
          <ChevronDown size={12} className="opacity-60" />
        </button>
      </Tooltip>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-[10px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg py-1 text-sm">
          <button
            type="button"
            className="w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between"
            onClick={() => {
              downloadText(`${base}.csv`, toCSV(data), "text/csv");
              setOpen(false);
            }}
          >
            CSV
          </button>
          <button
            type="button"
            className="w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between"
            onClick={() => {
              downloadText(`${base}.json`, toJSON(data), "application/json");
              setOpen(false);
            }}
          >
            JSON
          </button>
          <button
            type="button"
            className="w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between"
            onClick={() => {
              downloadText(`${base}.graphml`, toGraphML(data), "application/xml");
              setOpen(false);
            }}
          >
            GraphML
          </button>
          <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />
          <button
            type="button"
            className="w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between gap-2"
            onClick={() => copy("dot", toDOT(data))}
          >
            <span>Copy DOT</span>
            {copied === "dot" ? <Check size={13} /> : <Copy size={13} className="opacity-50" />}
          </button>
          <button
            type="button"
            className="w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between gap-2"
            onClick={() => copy("json", toJSON(data))}
          >
            <span>Copy JSON</span>
            {copied === "json" ? <Check size={13} /> : <Copy size={13} className="opacity-50" />}
          </button>
        </div>
      )}
    </div>
  );
}
