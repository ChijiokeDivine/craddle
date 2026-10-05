// components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Tooltip } from "./Tooltip";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("craddle-theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

interface ThemeToggleProps {
  /** Use cream-on-blue styling when placed on the brand-coloured header */
  onBrand?: boolean;
}

export function ThemeToggle({ onBrand = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = getInitialTheme();
    queueMicrotask(() => {
      setTheme(t);
      document.documentElement.classList.toggle("dark", t === "dark");
      setMounted(true);
    });
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("craddle-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <Tooltip content={theme === "dark" ? "Light mode" : "Dark mode"} side="bottom">
      <button
        type="button"
        onClick={toggle}
        className={`flex h-9 w-9 items-center justify-center transition-colors ${
          onBrand
            ? "text-brand-ink hover:bg-white/15"
            : "text-muted hover:bg-subtle hover:text-foreground"
        }`}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </Tooltip>
  );
}
