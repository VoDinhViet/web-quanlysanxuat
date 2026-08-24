import { z } from "zod"

import { isoDateFilter } from "@/lib/zod-transforms"

export const manageSearchSchema = z.object({
  startDate: isoDateFilter,
  endDate: isoDateFilter,
})

export type ManageSearchSchema = z.infer<typeof manageSearchSchema>
