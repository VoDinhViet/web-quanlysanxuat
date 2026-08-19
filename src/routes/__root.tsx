import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { SolarProvider } from "@solar-icons/react"
import type { QueryClient } from "@tanstack/react-query"

import { ThemeProvider } from "@/components/shared/layout/ThemeProvider"
import { Toaster } from "@/components/ui/sonner"
// Side-effect import, must run before any DateTime.fromISO() call on either
// server or client — see src/lib/luxon-config.ts for why.
import "@/lib/luxon-config"
// Side-effect import (not `?url`) so Start attaches the CSS to the route
// manifest and inlines it into the SSR <head> — no separate blocking
// stylesheet request, which is what caused the flash of unstyled content.
import appCss from "../styles.css?url"
// import "../styles.css"

type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Web QLSX - Cơ khí Tiến Huy",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>Không tìm thấy trang bạn yêu cầu.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <SolarProvider value={{ weight: "Bold" }}>{children}</SolarProvider>
          <Toaster richColors />
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
