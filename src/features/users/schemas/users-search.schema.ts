import { z } from "zod"

import { USER_STATUSES } from "@/features/users/types/user.type"
import { SORT_ORDERS } from "@/lib/types/pagination.type"

// Mirrors the backend's GetUsersReqDto (page, limit, q, order inherited from
// PageOptionsDto; status is user-specific). There is no department filter — the user
// resource doesn't carry one.
export const usersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(USER_STATUSES).optional().catch(undefined),
  order: z.enum(SORT_ORDERS).optional().catch(undefined),
})

export type UsersSearchSchema = z.infer<typeof usersSearchSchema>
