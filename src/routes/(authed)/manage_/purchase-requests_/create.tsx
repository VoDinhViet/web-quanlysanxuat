import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { PurchaseRequestCreatePage } from "@/features/purchase-requests/pages/PurchaseRequestCreatePage"

export const Route = createFileRoute(
  "/(authed)/manage_/purchase-requests_/create"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "purchase-requests:create"),
  component: PurchaseRequestCreatePage,
})
