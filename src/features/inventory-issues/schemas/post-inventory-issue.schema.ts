import { z } from "zod"

import { fileFieldSchema } from "@/lib/file-field.schema"
import { emptyToUndefined } from "@/lib/zod-transforms"

// Field names match PostInventoryIssueReqDto (be-quanlysanxuat); both are optional evidence that the
// receiver got the goods, same shape as post-supplier-return.schema.ts.
export const postInventoryIssueSchema = z.object({
  note: z
    .string()
    .trim()
    .max(500, "Ghi chú tối đa 500 ký tự.")
    .transform(emptyToUndefined),
  files: z.array(fileFieldSchema),
})

export type PostInventoryIssueSchema = z.infer<typeof postInventoryIssueSchema>
