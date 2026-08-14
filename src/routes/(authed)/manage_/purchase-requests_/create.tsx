import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { PurchaseRequestCreatePage } from "@/features/purchase-requests/pages/PurchaseRequestCreatePage"

// No loader: Phòng ban là 1 useQuery nhỏ trong header section — không có gì cần prefetch
// (cùng lý do inventory-receipts_/create.tsx không có loader).
export const Route = createFileRoute(
  "/(authed)/manage_/purchase-requests_/create"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "purchase-requests:create"),
  component: PurchaseRequestCreatePage,
})
