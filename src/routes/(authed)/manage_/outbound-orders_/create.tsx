import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { CreateOutboundOrderPage } from "@/features/outbound-orders/pages/CreateOutboundOrderPage"

// No loader: mọi query (kho, PO/Job cần giao) đều là useQuery ngay trong component, cùng lý do
// outsourcing-receipts_/create.tsx.
export const Route = createFileRoute(
  "/(authed)/manage_/outbound-orders_/create"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "outbound:create"),
  component: CreateOutboundOrderPage,
})
