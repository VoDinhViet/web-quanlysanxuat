import { createFileRoute } from "@tanstack/react-router"

import { CreatePurchaseOrderPage } from "@/features/purchase-orders/pages/CreatePurchaseOrderPage"

// No loader: the item picker (purchase-ledger rows) and supplier combobox are both
// client-interactive reads backed by plain useQuery — nothing to prefetch, same as
// purchase-quotations_/create.tsx.
export const Route = createFileRoute(
  "/(authed)/manage_/purchase-orders_/create"
)({
  component: CreatePurchaseOrderPage,
})
