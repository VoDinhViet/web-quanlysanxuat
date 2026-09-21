import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"

import { logout } from "@/features/auth/api/server-functions/logout.api"

/** Owner-side mutation hook — owns the whole logout sequence so shared chrome
 *  (PageTitleBar) just calls `mutate()`. Always navigates to /login regardless of
 *  outcome — a failed backend revoke shouldn't strand the user on an authenticated page. */
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const logoutFn = useServerFn(logout)

  return useMutation({
    mutationFn: () => logoutFn(),
    // Always navigate away regardless of outcome — a failed backend revoke
    // shouldn't strand the user on an authenticated page.
    onSettled: async () => {
      // Clear before navigating (mirrors LoginForm.tsx) — the server already cleared the
      // session by the time this runs, so an observer still mounted during the async
      // navigate() window would only ever refetch into a 401, never stale data. Still,
      // clearing first removes that pointless refetch entirely instead of relying on timing.
      queryClient.clear()
      await router.invalidate()
      await router.navigate({ to: "/login" })
    },
  })
}
