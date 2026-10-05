// components/ExportMenu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Copy, Check, ChevronDown } from "lucide-react";
import type { DepsResponse } from "@/types";
import { toCSV, toJSON, toDOT, toGraphML, downloadText } from "@/lib/export";
import { toMermaid } from "@/lib/mermaid";

interface ExportMenuProps {
  data: DepsResponse;
}

const itemClass =
  "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-subtle hover:text-accent";

export function ExportMenu({ data }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const short = data.address.slice(0, 10);
  const base = `craddle-${short}-${data.chainId}`;

  const copy = async (kind: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  };

  const download = (name: string, content: string, mime: string) => {
    downloadText(name, content, mime);
    setOpen(false);
  };

  const copyIcon = (kind: string) =>
    copied === kind ? <Check size={13} /> : <Copy size={13} className="opacity-50" />;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-1.5 border border-line bg-card px-3 text-sm transition-colors hover:border-accent hover:text-accent"
      >
        <Download size={14} />
        Export
        <ChevronDown size={12} className="opacity-60" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 border border-line bg-card py-1 shadow-[4px_4px_0_0_var(--brand)]"
        >
          <p className="px-3 pb-1 pt-1.5 font-mono text-[11px] text-muted">{"// download"}</p>
          <button type="button" role="menuitem" className={itemClass} onClick={() => download(`${base}.csv`, toCSV(data), "text/csv")}>
            CSV
          </button>
          <button type="button" role="menuitem" className={itemClass} onClick={() => download(`${base}.json`, toJSON(data), "application/json")}>
            JSON
          </button>
          <button type="button" role="menuitem" className={itemClass} onClick={() => download(`${base}.graphml`, toGraphML(data), "application/xml")}>
            GraphML
          </button>
          <div className="my-1 border-t border-line" />
          <p className="px-3 pb-1 pt-1.5 font-mono text-[11px] text-muted">{"// copy"}</p>
          <button type="button" role="menuitem" className={itemClass} onClick={() => copy("mermaid", toMermaid(data))}>
            <span>Mermaid diagram</span>
            {copyIcon("mermaid")}
          </button>
          <button type="button" role="menuitem" className={itemClass} onClick={() => copy("dot", toDOT(data))}>
            <span>Graphviz DOT</span>
            {copyIcon("dot")}
          </button>
          <button type="button" role="menuitem" className={itemClass} onClick={() => copy("json", toJSON(data))}>
            <span>JSON</span>
            {copyIcon("json")}
          </button>
        </div>
      )}
    </div>
  );
}
