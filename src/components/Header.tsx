// components/Header.tsx
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="on-brand border-b border-white/15 bg-brand text-brand-ink">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2.5" aria-label="craddle home">
          <Logo size={22} />
          <span className="text-base font-bold tracking-tight">craddle</span>
        </a>

        <div className="flex items-center gap-1">
          <span className="mr-2 hidden items-center gap-1.5 font-mono text-xs text-brand-ink/70 sm:flex">
            press
            <kbd className="border border-white/40 px-1.5 py-0.5 text-[11px] leading-none">
              /
            </kbd>
            to search
          </span>
          <ThemeToggle onBrand />
        </div>
      </div>
    </header>
  );
}
