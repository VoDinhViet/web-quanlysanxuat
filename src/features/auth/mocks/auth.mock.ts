import type { AuthLoginResponse } from "@/features/auth/types/login.type"

// Dev-only stand-in for POST /auth/login, selected by VITE_USE_MOCK_AUTH=true so UI
// work does not need a running authentication service. The login server function
// refuses to build for production while mock mode is enabled.
export const MOCK_ACCOUNT = {
  email: "dev@qlsx.local",
  password: "dev123456",
} as const

const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7

export function mockLoginWithEmailPassword(
  email: string,
  password: string
): AuthLoginResponse | null {
  if (email !== MOCK_ACCOUNT.email || password !== MOCK_ACCOUNT.password) {
    return null
  }

  return {
    userId: "NV001",
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    expiresIn: SEVEN_DAYS_SECONDS,
  }
}
