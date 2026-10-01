import { z } from "zod"

// Wire contract for POST /api/production-jobs/:jobId/bom — shared by AddProductionJobIssuesDialog's
// form and the server function's validator (see CreateProductionJobIssuesReqDto). One request adds
// 1..n items at once; the backend rejects a item that repeats or is already on the Job.
const productionJobIssueSchema = z.object({
  itemId: z.string().trim().min(1, "Vui lòng chọn vật tư"),
  requiredQty: z
    .number("Số lượng phải lớn hơn 0")
    .positive("Số lượng phải lớn hơn 0")
    .optional()
    .pipe(z.number("Số lượng phải lớn hơn 0")),
})

export const createProductionJobIssuesSchema = z.object({
  productionJobId: z.uuid(),
  items: z
    .array(productionJobIssueSchema)
    .min(1, "Vui lòng thêm ít nhất 1 vật tư")
    .refine(
      (items) =>
        new Set(items.map((item) => item.itemId)).size === items.length,
      "Mỗi vật tư chỉ được chọn một lần"
    ),
})

export type CreateProductionJobIssuesSchema = z.input<
  typeof createProductionJobIssuesSchema
>
