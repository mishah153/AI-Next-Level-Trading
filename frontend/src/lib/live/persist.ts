import type { QueryClient } from "@tanstack/react-query";

/**
 * Mock-mode persistence: mirrors the mutable query caches to localStorage so
 * demo CRUD (orders, connections, strategies) survives a full page refresh.
 * In live (API) mode this is unused — the backend is the source of truth.
 */
const PERSISTED_KEYS = ["orders", "connections", "strategies"] as const;
const storageKey = (key: string) => `nlt.mock.${key}`;

export function hydrateMockCache(qc: QueryClient): void {
  if (typeof window === "undefined") return;
  for (const key of PERSISTED_KEYS) {
    const raw = localStorage.getItem(storageKey(key));
    if (!raw) continue;
    try {
      qc.setQueryData([key], JSON.parse(raw));
    } catch {
      localStorage.removeItem(storageKey(key));
    }
  }
}

export function subscribeMockCache(qc: QueryClient): () => void {
  if (typeof window === "undefined") return () => undefined;
  return qc.getQueryCache().subscribe((event) => {
    const key = event.query.queryKey?.[0];
    if (typeof key !== "string") return;
    if (!(PERSISTED_KEYS as readonly string[]).includes(key)) return;
    const data = qc.getQueryData([key]);
    if (data === undefined) return;
    try {
      localStorage.setItem(storageKey(key), JSON.stringify(data));
    } catch {
      /* quota / serialization issues are non-fatal for the demo */
    }
  });
}
