import { createIsomorphicFn } from "@tanstack/react-start"
import { getCookie } from "@tanstack/react-start/server"

// shadcn's SidebarProvider (src/components/ui/sidebar.tsx) writes this cookie on every
// toggle but never reads it back, so a collapsed sidebar silently re-expands on reload.
// Both sides read the same cookie so SSR and hydration agree on the initial state.
export const getSidebarDefaultOpen = createIsomorphicFn()
  .server(() => getCookie("sidebar_state") !== "false")
  .client(() => {
    const cookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("sidebar_state="))
    return cookie?.split("=")[1] !== "false"
  })
