import { z } from "zod"

import { fileFieldSchema } from "@/lib/file-field.schema"
import { emptyToUndefined } from "@/lib/zod-transforms"

// Tên field khớp PostSupplierReturnReqDto (be-quanlysanxuat) — cả `note` lẫn `files` đều tuỳ chọn,
// cùng khuôn create-job-operation-report.schema.ts.
export const postSupplierReturnSchema = z.object({
  note: z
    .string()
    .trim()
    .max(500, "Ghi chú tối đa 500 ký tự.")
    .transform(emptyToUndefined),
  files: z.array(fileFieldSchema),
})

export type PostSupplierReturnSchema = z.infer<typeof postSupplierReturnSchema>
