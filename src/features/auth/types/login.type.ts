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

/** The subset of GET /users/me (UserResDto) used to resolve a display name. */
export type AuthUserProfile = {
  fullName: string | null
  username: string
}
