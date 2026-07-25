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
 * The subset of GET /users/me used by the app: the identity fields shown in the
 * profile menu (name, username, email, avatar) plus the RBAC fields (role +
 * effective permissions) that drive permission-based UI. `avatar` is the signed,
 * host-relative file URL (or null) — resolve it with `resolveFileUrl` before use.
 */
export type AuthUserProfile = {
  fullName: string | null
  username: string
  email: string
  avatar: string | null
  role: { code: string; name: string } | null
  permissions: string[]
}
