"use client";

import { useEffect } from "react";
import { useChatStore } from "@/lib/chat/store";

export function Toast() {
  const toast = useChatStore((s) => s.toast);
  const patch = useChatStore((s) => s.patch);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => patch({ toast: null }), 2600);
    return () => clearTimeout(t);
  }, [toast, patch]);

  if (!toast) return null;
  return (
    <div role="status" className="fixed left-1/2 top-6 z-30 -translate-x-1/2 rounded-pill bg-mist px-5 py-2 text-sm font-medium text-ink shadow-lg">
      {toast}
    </div>
  );
}
