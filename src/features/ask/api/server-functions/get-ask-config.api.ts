import { createServerFn } from "@tanstack/react-start"
import { setResponseHeader } from "@tanstack/react-start/server"

import { readAskEnv } from "@/features/ask/api/ask-env.server"
import { getAppSession, isSessionExpired } from "@/lib/session.server"
import type { AskConfig } from "@/lib/types/ask.type"

// Nothing returned here is secret (the app key stays in `createAskSession`), but only a signed-in
// user has any use for it, so a signed-out caller gets `null` like a deployment with Ask off.
export const getAskConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<AskConfig | null> => {
    setResponseHeader("Cache-Control", "no-store")

    const askEnv = readAskEnv()
    const currentSession = await getAppSession()

    if (!askEnv || isSessionExpired(currentSession)) {
      return null
    }

    return { scriptUrl: `${askEnv.baseUrl}/embed.js`, appId: askEnv.appId }
  }
)
