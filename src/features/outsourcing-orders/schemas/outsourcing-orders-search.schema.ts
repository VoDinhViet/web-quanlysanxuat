import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import { OutsourcingOrderStatus } from "@/lib/types/outsourcing-order.type"

export const outsourcingOrdersSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined), // Mã phiếu, NCC, công đoạn
  status: z.enum(OutsourcingOrderStatus).optional().catch(undefined),
})

export type OutsourcingOrdersSearchSchema = z.infer<
  typeof outsourcingOrdersSearchSchema
>
