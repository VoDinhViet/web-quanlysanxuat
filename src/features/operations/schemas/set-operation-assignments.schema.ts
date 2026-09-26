import { z } from "zod"

// Wire contract for PUT /api/operations/:operationId/assignments — the whole assignment list, not a delta.
export const setOperationAssignmentsSchema = z.object({
  operationId: z.uuid(),
  userIds: z.array(z.uuid()),
})

export type SetOperationAssignmentsSchema = z.input<
  typeof setOperationAssignmentsSchema
>
