import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  keepSignedIn: z.boolean(),
})

export const loginActionSchema = loginSchema.extend({
  redirectTo: z.string().optional(),
})

export const loginSearchSchema = z.object({
  redirectTo: z.string().optional().catch(undefined),
})

export type LoginSchema = z.infer<typeof loginSchema>
