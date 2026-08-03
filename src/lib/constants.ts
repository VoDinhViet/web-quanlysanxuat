// Backend base URL and request timeout. They live here rather than in `http.ts`
// so `auth-token.ts` (which builds its own interceptor-free client for the
// refresh call) can read them without importing `http.ts` and forming a cycle.
export const API_BASE_URL = import.meta.env.VITE_API_URL || ""
export const HTTP_TIMEOUT_MS = 30_000
