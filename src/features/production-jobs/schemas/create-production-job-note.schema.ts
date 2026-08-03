import { z } from "zod"

// Wire contract for POST /api/production-jobs/:jobId/notes — shared by ProductionJobNotesSection's
// form and the server function's validator (the backend requires 1-1000 chars, see
// CreateProductionJobNoteReqDto).
export const createProductionJobNoteSchema = z.object({
  productionJobId: z.uuid(),
  content: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập nội dung ghi chú")
    .max(1000, "Ghi chú tối đa 1000 ký tự"),
})

export type CreateProductionJobNoteSchema = z.infer<
  typeof createProductionJobNoteSchema
>
