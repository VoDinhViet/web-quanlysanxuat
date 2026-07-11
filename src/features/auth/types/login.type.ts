export type CurrentSession = {
  userId: string
}

/** Success body of POST /auth/login — see specs/001-email-password-login/contracts/auth-api.md */
export type AuthLoginResponse = {
  userId: string
  accessToken: string
  refreshToken: string
  /** Seconds until the access token expires */
  expiresIn: number
}
