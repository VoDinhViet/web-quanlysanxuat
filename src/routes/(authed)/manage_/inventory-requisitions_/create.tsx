import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { InventoryRequisitionCreatePage } from "@/features/inventory-requisitions/pages/InventoryRequisitionCreatePage"
import { InventoryRequisitionType } from "@/lib/types/inventory-requisition.type"

const inventoryRequisitionCreateSearchSchema = z.object({
  type: z.enum(InventoryRequisitionType).optional().catch(undefined),
  productionJobId: z.string().optional().catch(undefined),
})

export const Route = createFileRoute(
  "/(authed)/manage_/inventory-requisitions_/create"
)({
  validateSearch: inventoryRequisitionCreateSearchSchema,
  component: InventoryRequisitionCreatePage,
})
