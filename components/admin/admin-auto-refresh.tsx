"use client";

import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";

export function AdminAutoRefresh() {
  const router = useRouter();
  const [tickAt, setTickAt] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") {
        return;
      }

      setTickAt(Date.now());
      router.refresh();
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [router]);

  const lastSyncLabel = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(tickAt));

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge>Auto refresh 15s</Badge>
      <p className="inline-flex items-center gap-2 text-sm text-muted">
        <RefreshCcw className="h-4 w-4" />
        Sinkron terakhir {lastSyncLabel}
      </p>
      <button
        type="button"
        onClick={() => {
          setTickAt(Date.now());
          router.refresh();
        }}
        className="rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-medium transition hover:bg-white"
      >
        Refresh sekarang
      </button>
    </div>
  );
}
