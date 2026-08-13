import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { inventoryReceiptsQueryOptions } from "@/features/inventory-receipts/api/options"
import { InventoryReceiptsPage } from "@/features/inventory-receipts/pages/InventoryReceiptsPage"
import { inventoryReceiptsSearchSchema } from "@/features/inventory-receipts/schemas/inventory-receipts-search.schema"

export const Route = createFileRoute("/(authed)/manage_/inventory-receipts")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "inventory:read"),
  validateSearch: inventoryReceiptsSearchSchema,
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      inventoryReceiptsQueryOptions(
        inventoryReceiptsSearchSchema.parse(location.search)
      )
    ),
  component: InventoryReceiptsPage,
  pendingComponent: PageLoading,
})
