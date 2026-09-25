import { z } from "zod"

// Wire contract for POST /api/items/:id/copy on a DIRECT — also the client-side onSubmit
// validator for CopyDirectDialog. Unlike a product copy, a direct copy takes a new `code`
// (the backend keeps `revision` at its default) and an optional new `name`.
export const copyDirectSchema = z.object({
  itemId: z.uuid(),
  code: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã vật tư")
    .max(50, "Mã vật tư tối đa 50 ký tự"),
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên vật tư")
    .max(255, "Tên vật tư tối đa 255 ký tự"),
})

export type CopyDirectSchema = z.input<typeof copyDirectSchema>
