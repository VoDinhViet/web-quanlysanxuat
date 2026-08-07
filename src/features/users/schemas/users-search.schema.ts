import { z } from "zod"

// Mirrors the backend's GetUsersReqDto (page, limit, q, order inherited from
// PageOptionsDto; status is user-specific). There is no department filter — the user
// resource doesn't carry one.
export const usersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(["WORKING", "RESIGNED"]).optional().catch(undefined),
  order: z.enum(["ASC", "DESC"]).optional().catch(undefined),
})

export type UsersSearchSchema = z.infer<typeof usersSearchSchema>
