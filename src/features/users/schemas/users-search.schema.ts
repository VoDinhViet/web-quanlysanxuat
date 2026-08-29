import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
// Mirrors the backend's GetUsersReqDto (page, limit, q, order inherited from
// PageOptionsDto; status is user-specific). There is no department filter — the user
// resource doesn't carry one.
export const usersSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(["WORKING", "RESIGNED"]).optional().catch(undefined),
  order: z.enum(["ASC", "DESC"]).optional().catch(undefined),
})

export type UsersSearchSchema = z.infer<typeof usersSearchSchema>
