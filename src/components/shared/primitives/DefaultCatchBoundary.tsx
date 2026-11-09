import { useRouter, useRouterState } from "@tanstack/react-router"
import { AlertOctagon } from "lucide-react"
import type { ErrorComponentProps } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { useSessionWatchdog } from "@/features/auth/api"
import { getErrorMessage } from "@/lib/utils"

// Router-level fallback for every route without its own errorComponent — everything outside
// (authed), and every page route inside it (the shell and sidebar stay around the message).
// Deliberately a second copy of AuthedErrorFallback's markup rather than a shared shell.
export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isAuthedArea = useRouterState({
    select: (state) =>
      state.matches.some((match) => match.routeId === "/(authed)"),
  })
  // A dead session (e.g. the account was disabled) surfaces as this generic error; check it so
  // the user lands on /login instead of retrying forever. Public pages have no session to lose.
  useSessionWatchdog(isAuthedArea)

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground">
      <AlertOctagon className="size-10 text-destructive" />
      <p className="text-sm font-medium text-muted-foreground">
        {getErrorMessage(error)}
      </p>
      <Button type="button" onClick={() => void router.invalidate()}>
        Thử lại
      </Button>
    </div>
  )
}
