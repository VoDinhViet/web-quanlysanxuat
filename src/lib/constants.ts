// Reference lists (units, groups, options dropdowns, ...) change rarely — cache
// them longer than the default `staleTime` so moving between list/create/update
// doesn't refetch them on every navigation.
export const REFERENCE_STALE_TIME = 5 * 60_000

// Backend base URL and request timeout. They live here rather than in `http.ts`
// so `auth-token.ts` (which builds its own interceptor-free client for the
// refresh call) can read them without importing `http.ts` and forming a cycle.
export const API_BASE_URL = import.meta.env.VITE_API_URL || ""
export const HTTP_TIMEOUT_MS = 30_000
