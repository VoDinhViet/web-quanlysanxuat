import { tz } from "@date-fns/tz"

// The ERP is only used in Vietnam, and date-fns has no default zone, so every parse, "now" and
// format pins this zone: `parseISO(value, { in: vnZone })`, `format(date, pattern, { in: vnZone })`,
// `vnZone(Date.now())`. Without it the server (TZ=UTC in a container) and the browser (+07:00)
// print the same ISO string as different text, React discards the server HTML and re-renders on
// every F5 (hydration mismatch).
export const vnZone = tz("Asia/Ho_Chi_Minh")
