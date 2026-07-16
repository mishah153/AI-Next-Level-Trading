/** API integration configuration, driven by NEXT_PUBLIC_* env vars. */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/** When true, screens read from the live NestJS API; otherwise from mock data. */
export const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";

/** WebSocket origin (API origin without the /api/v1 suffix). */
export const WS_URL = API_URL.replace(/\/api\/v1\/?$/, "");

