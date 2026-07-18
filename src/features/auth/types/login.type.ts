export type CurrentSession = {
  userId: string
}

/** Success body of POST /auth/login and POST /auth/refresh (LoginResDto). */
export type AuthLoginResponse = {
  userId: string
  accessToken: string
  refreshToken: string
  tokenType: string
}

/**
 * The subset of GET /users/me used by the app: a display name plus the RBAC
 * fields (role + effective permissions) that drive permission-based UI.
 */
export type AuthUserProfile = {
  fullName: string | null
  username: string
  role: { code: string; name: string } | null
  permissions: string[]
}
