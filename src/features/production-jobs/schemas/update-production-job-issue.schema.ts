import { z } from "zod"

// Wire contract for PATCH /api/production-jobs/:jobId/bom/:issueId — only the quantity is
// editable (see UpdateProductionJobIssueReqDto).
export const updateProductionJobIssueSchema = z.object({
  productionJobId: z.uuid(),
  issueId: z.uuid(),
  requiredQty: z
    .number("Số lượng phải lớn hơn 0")
    .positive("Số lượng phải lớn hơn 0")
    .optional()
    .pipe(z.number("Số lượng phải lớn hơn 0")),
})

export type UpdateProductionJobIssueSchema = z.input<
  typeof updateProductionJobIssueSchema
>
