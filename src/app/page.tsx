import { Suspense } from "react";
import { HomeClient } from "@/components/HomeClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-full items-center justify-center text-sm text-zinc-400">
          Loading…
        </div>
      }
    >
      <HomeClient />
    </Suspense>
  );
}
