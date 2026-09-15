import { z } from "zod"

// Mirrors the backend's GetDepartmentsReqDto (page, limit, q inherited from PageOptionsDto;
// isActive is department-specific).
export const departmentsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  isActive: z
    .preprocess((val) => {
      if (val === "true" || val === true) return true
      if (val === "false" || val === false) return false
      return undefined
    }, z.boolean().optional())
    .catch(undefined),
})

export type DepartmentsSearchSchema = z.infer<typeof departmentsSearchSchema>
