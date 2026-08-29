import type { FileResource } from "@/lib/types/file.type"

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
 * effective permissions) that drive permission-based UI. `avatar` mirrors the
 * backend's `FileResDto | null` (via `FileField('avatarFile', ...)` on
 * `CurrentUserResDto`) — resolve `avatar.url` with `resolveFileUrl` before use, never
 * the object itself.
 */
export type AuthUserProfile = {
  fullName: string | null
  username: string
  email: string
  avatar: FileResource | null
  role: { code: string; name: string } | null
  permissions: string[]
}
