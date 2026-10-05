// components/Footer.tsx
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="on-brand mt-16 bg-brand text-brand-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={22} />
            <span className="text-lg font-bold tracking-tight">craddle</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-brand-ink/80">
            Read the wiring of any smart contract before you trust it.
          </p>
        </div>
        <div className="font-mono text-xs text-brand-ink/80 sm:text-right">
          <p>
            Data from{" "}
            <a
              href="https://www.blockscout.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-brand-ink"
            >
              Blockscout
            </a>
          </p>
          <p className="mt-1">{"// observations are not an audit"}</p>
        </div>
      </div>
    </footer>
  );
}
