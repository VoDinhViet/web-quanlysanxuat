import { z } from "zod"

// Wire contract for POST /api/items/:id/copy — also the client-side onSubmit validator for
// CopyProductDialog. The copy keeps the source product's `code`; the user only picks a new
// `revision` for it.
export const copyProductSchema = z.object({
  itemId: z.uuid(),
  revision: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập phiên bản")
    .max(50, "Phiên bản tối đa 50 ký tự"),
})

export type CopyProductSchema = z.input<typeof copyProductSchema>
