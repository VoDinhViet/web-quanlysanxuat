import { useEffect, useRef } from "react"
import { useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { getCurrentSession } from "@/features/auth/api/server-functions/get-current-session.api"

// `beforeLoad`'s `requireSession` only re-checks the session on navigation — a tab left open and
// idle never re-enters it, so an expired refresh token only surfaces as a raw error on whatever
// query/mutation the user eventually retries (BUG-003). This polls the same primitive
// `beforeLoad` uses so an idle tab gets bounced to /login proactively instead.
const POLL_INTERVAL_MS = 5 * 60_000

export function useSessionWatchdog() {
  const router = useRouter()
  const getCurrentSessionFn = useServerFn(getCurrentSession)
  const hasRedirectedRef = useRef(false)

  const { isError } = useQuery({
    queryKey: ["auth", "session-watchdog"],
    queryFn: () => getCurrentSessionFn(),
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
    retry: false,
    staleTime: 0,
  })

  useEffect(() => {
    if (!isError || hasRedirectedRef.current) {
      return
    }
    hasRedirectedRef.current = true

    toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.")
    void router.navigate({
      to: "/login",
      search: { redirectTo: router.state.location.href },
      replace: true,
    })
  }, [isError, router])
}
