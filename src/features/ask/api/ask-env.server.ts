import { z } from "zod"

type AskEnv = {
  baseUrl: string
  appId: string
  appKey: string | undefined
}

const appIdSchema = z.uuid()

// The user's ERP token and the app key are sent to this host, so a typo or a plain-http URL must
// turn Ask off instead of leaking them: only `development` may use plain http, and only the
// origin is kept (no path, no credentials in the URL).
function resolveBaseUrl(rawUrl: string | undefined): string | null {
  if (!rawUrl) {
    return null
  }

  try {
    const url = new URL(rawUrl)
    const isSecure =
      url.protocol === "https:" ||
      (url.protocol === "http:" && process.env.NODE_ENV === "development")

    if (!isSecure || url.username || url.password) {
      return null
    }

    return url.origin
  } catch {
    return null
  }
}

// Read at request time (not a `VITE_` build constant) so Ask can be switched on or off, or
// pointed elsewhere, by changing the server environment without rebuilding the image. Returns
// `null` when Ask is off or misconfigured.
export function readAskEnv(): AskEnv | null {
  const baseUrl = resolveBaseUrl(process.env.AI_PLATFORM_URL)
  const appId = appIdSchema.safeParse(process.env.AI_PLATFORM_EMBED_APP_ID)

  if (!baseUrl || !appId.success) {
    return null
  }

  return {
    baseUrl,
    appId: appId.data,
    appKey: process.env.AI_PLATFORM_EMBED_APP_KEY || undefined,
  }
}
