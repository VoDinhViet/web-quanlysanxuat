export type AppSessionData = {
  userId?: string
  accessToken?: string
  refreshToken?: string
  tokenExpires?: number
  // Whether "keepSignedIn" was ticked at login; a refresh must not turn a
  // browser-session cookie into a persistent one.
  persist?: boolean
  // Absolute end of the session (epoch ms), set once at login and never
  // extended — bounds a sealed cookie that has no expiry of its own.
  sessionExpires?: number
}
