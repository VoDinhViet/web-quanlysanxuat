import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

import { askConfigQueryOptions } from "@/features/ask/api/options"
import { createAskSession } from "@/features/ask/api/server-functions/create-ask-session.api"
import type { AskConfig, AskSession } from "@/lib/types/ask.type"

type AiPlatformEmbedOptions = {
  appId: string
  getToken: () => Promise<AskSession>
  label?: string
  offsetRight?: number
  offsetBottom?: number
}

declare global {
  interface Window {
    AiPlatformEmbed?: {
      init: (options: AiPlatformEmbedOptions) => void
      destroy?: () => void
    }
  }
}

const askLabel = "Hỏi dữ liệu (Ask)"
// The TanStack devtools toggle (56px, 8px from the corner) sits in the same corner in `pnpm dev`;
// stack the bubble right above it, on the same column.
const askOffsetRight = import.meta.env.DEV ? 8 : undefined
const askOffsetBottom = import.meta.env.DEV ? 72 : undefined
const embedScriptSelector = "script[data-ask-embed]"

type EmbedScriptLoad = {
  scriptUrl: string
  promise: Promise<void>
}

// One load per page, shared by every mount: StrictMode and layout swaps mount the hook twice in
// a row, and a second <script> for the same file would run `embed.js` twice with separate state.
let embedScriptLoad: EmbedScriptLoad | null = null

// `embed.js` reads its own origin from `document.currentScript`, so it has to run as a classic
// script tag.
function loadEmbedScript(scriptUrl: string): Promise<void> {
  if (embedScriptLoad?.scriptUrl === scriptUrl) {
    return embedScriptLoad.promise
  }

  const existing =
    document.querySelector<HTMLScriptElement>(embedScriptSelector)

  if (existing?.getAttribute("src") === scriptUrl && window.AiPlatformEmbed) {
    return Promise.resolve()
  }

  existing?.remove()

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")

    script.src = scriptUrl
    script.async = true
    script.dataset.askEmbed = ""
    script.addEventListener("load", () => resolve())
    script.addEventListener("error", () => {
      script.remove()

      if (embedScriptLoad?.promise === promise) {
        embedScriptLoad = null
      }

      reject(new Error("Failed to load the Ask embed script"))
    })
    document.head.appendChild(script)
  })

  embedScriptLoad = { scriptUrl, promise }

  return promise
}

// Floating Ask bubble for the signed-in layout. `embed.js` owns the button and the iframe; this
// hook mounts it and tears it down when the layout unmounts (logout, route change).
export function useAskEmbed() {
  const { data: askConfig } = useQuery(askConfigQueryOptions())

  useEffect(() => {
    if (!askConfig) {
      return
    }

    let isCancelled = false
    let isMounted = false

    async function mountAsk(config: AskConfig) {
      try {
        await loadEmbedScript(config.scriptUrl)

        if (isCancelled) {
          return
        }

        if (!window.AiPlatformEmbed) {
          return
        }

        // Flag first so a throw halfway through `init` still gets its leftovers destroyed.
        isMounted = true
        window.AiPlatformEmbed.init({
          appId: config.appId,
          getToken: () => createAskSession(),
          label: askLabel,
          offsetRight: askOffsetRight,
          offsetBottom: askOffsetBottom,
        })
      } catch {
        // Ask is optional: a missing or unreachable AI platform must not break the ERP.
      }
    }

    void mountAsk(askConfig)

    return () => {
      isCancelled = true

      if (isMounted) {
        window.AiPlatformEmbed?.destroy?.()
      }
    }
  }, [askConfig])
}
