/** Client-side JWT storage. Kept intentionally small and framework-agnostic. */

const ACCESS_KEY = "nlt.accessToken";
const REFRESH_KEY = "nlt.refreshToken";

const isBrowser = () => typeof window !== "undefined";

export const tokenStore = {
  getAccess(): string | null {
    return isBrowser() ? localStorage.getItem(ACCESS_KEY) : null;
  },
  getRefresh(): string | null {
    return isBrowser() ? localStorage.getItem(REFRESH_KEY) : null;
  },
  set(accessToken: string, refreshToken: string): void {
    if (!isBrowser()) return;
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
