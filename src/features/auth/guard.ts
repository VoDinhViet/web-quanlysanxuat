import { redirect } from "@tanstack/react-router"

import { getCurrentSession } from "@/features/auth/server-functions/get-current-session"
import type { CurrentSession } from "@/features/auth/types/login.type"

/**
 * The single place that decides whether a protected route may render. Called from the
 * `(authed)` layout's `beforeLoad` so every route nested under it inherits the guard —
 * do not duplicate this check elsewhere (see CLAUDE.md "Layer boundaries").
 */
export async function requireSession(location: {
  href: string
}): Promise<CurrentSession> {
  try {
    return await getCurrentSession()
  } catch {
    throw redirect({
      to: "/login",
      search: { redirectTo: location.href },
    })
  }
}
