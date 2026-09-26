import { z } from "zod"

// Mirrors the backend's GetUsersReqDto (page, limit, q, order inherited from
// PageOptionsDto; status/departmentId/positionId are user-specific). `departmentId` has its own
// select in the main filter bar (UsersTableFilter); `positionId` has no filter control of its
// own — it only ever arrives via a deep link from the department detail screen's "n người"
// links (see DepartmentDetailPage) and narrows the already-selected department further.
export const usersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(["WORKING", "RESIGNED"]).optional().catch(undefined),
  order: z.enum(["ASC", "DESC"]).optional().catch(undefined),
  departmentId: z.uuid().optional().catch(undefined),
  positionId: z.uuid().optional().catch(undefined),
  // Only used by the operation detail page's assign dialog (hide staff already on that operation);
  // no filter control of its own.
  excludeOperationId: z.uuid().optional().catch(undefined),
})

export type UsersSearchSchema = z.infer<typeof usersSearchSchema>
