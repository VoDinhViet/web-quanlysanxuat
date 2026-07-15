// Const-tuple so the same values feed both the type and z.enum(USER_STATUSES) in
// users-search.schema.ts, instead of duplicating the literals.
export const USER_STATUSES = ["ACTIVE", "INACTIVE"] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Tạm ngưng",
}

export const USER_GENDERS = ["MALE", "FEMALE", "OTHER"] as const
export type UserGender = (typeof USER_GENDERS)[number]

export const USER_GENDER_LABELS: Record<UserGender, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
}

export const EMPLOYMENT_STATUSES = ["WORKING", "RESIGNED"] as const
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number]

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  WORKING: "Đang làm việc",
  RESIGNED: "Đã nghỉ việc",
}

/** Mirrors the backend's UserResDto (GET /users, GET /users/:userId). */
export type User = {
  id: string
  code: string
  username: string
  email: string
  fullName: string | null
  phoneNumber: string | null
  dateOfBirth: string | null
  gender: UserGender | null
  status: UserStatus
  createdAt: string
  updatedAt: string
}
