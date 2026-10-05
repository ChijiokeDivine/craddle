// app/page.tsx
import { Suspense } from "react";
import { HomeClient } from "@/components/HomeClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-col items-center justify-center bg-brand font-mono text-sm text-brand-ink">
          {"// loading"}
          <span className="cursor-blink">_</span>
        </div>
      }
    >
      <HomeClient />
    </Suspense>
  );
}
