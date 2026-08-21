import { z } from "zod"

import { MaterialIssueStatus } from "@/lib/types/material-issue.type"

export const materialIssuesSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined), // Từ khóa: mã, tên vật tư
  code: z.string().trim().min(1).optional().catch(undefined), // Mã phiếu lãnh
  reason: z.string().trim().min(1).optional().catch(undefined), // PO / Lý do
  jobCode: z.string().trim().min(1).optional().catch(undefined), // Job
  departmentId: z.string().trim().min(1).optional().catch(undefined), // Bộ phận
  status: z.enum(MaterialIssueStatus).optional().catch(undefined), // Trạng thái
})

export type MaterialIssuesSearchSchema = z.infer<
  typeof materialIssuesSearchSchema
>
