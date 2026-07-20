// Reference list for a <select> — assumed to stay well under 100 rows, so
// fetched in one page instead of exposing pagination on a dropdown.
export const FILTER_OPTIONS_LIMIT = 100

// Backend base URL and request timeout. They live here rather than in `http.ts`
// so `auth-token.ts` (which builds its own interceptor-free client for the
// refresh call) can read them without importing `http.ts` and forming a cycle.
export const API_BASE_URL = import.meta.env.VITE_API_URL || ""
export const HTTP_TIMEOUT_MS = 30_000
