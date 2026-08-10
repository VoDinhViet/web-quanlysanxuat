import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { CreateQuotationPage } from "@/features/purchase-quotations/pages/CreateQuotationPage"

// No loader: the item picker (purchase-ledger rows) and supplier combobox are both
// client-interactive reads backed by plain useQuery — nothing to prefetch, same as
// orders_/create.tsx.
export const Route = createFileRoute(
  "/(authed)/manage_/purchase-quotations_/create"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "purchasing:create"),
  component: CreateQuotationPage,
})
