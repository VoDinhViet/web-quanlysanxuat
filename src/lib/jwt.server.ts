/**
 * Decodes a JWT's `exp` claim without verifying the signature — verification happens
 * server-side whenever the token is actually used. This purely tells the session guard
 * when to proactively refresh, since the auth backend's login/refresh responses don't
 * include a separate `expiresIn` field.
 */
export function decodeJwtExpiry(token: string): number | null {
  const payloadSegment = token.split(".")[1]

  if (!payloadSegment) {
    return null
  }

  try {
    const json = Buffer.from(payloadSegment, "base64url").toString("utf-8")
    const payload: unknown = JSON.parse(json)

    if (
      typeof payload === "object" &&
      payload !== null &&
      "exp" in payload &&
      typeof payload.exp === "number"
    ) {
      return payload.exp * 1000
    }

    return null
  } catch {
    return null
  }
}
