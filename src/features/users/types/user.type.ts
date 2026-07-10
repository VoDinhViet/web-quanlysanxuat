export type UserStatus = "Hoạt động" | "Tạm ngưng"

export type User = {
  id: string
  name: string
  department: string
  position: string
  email: string
  phone: string
  status: UserStatus
  initials: string
  avatarFallbackSrc: string
  avatarClassName: string
}
