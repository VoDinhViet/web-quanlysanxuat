import { z } from "zod"

export const loginSchema = z.object({
  identifier: z.string().min(1, "Vui lòng nhập email hoặc tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  keepSignedIn: z.boolean(),
})

export const loginSearchSchema = z.object({
  redirectTo: z.string().optional().catch(undefined),
})

export type LoginSchema = z.infer<typeof loginSchema>
