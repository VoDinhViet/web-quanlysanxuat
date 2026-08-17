import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { CreateOutsourcingReceiptPage } from "@/features/outsourcing-receipts/pages/CreateOutsourcingReceiptPage"

// No loader: mọi query (NCC, kho, công đoạn, hàng cần nhận) đều là useQuery ngay trong component,
// cùng lý do outsourcing-orders_/create.tsx.
export const Route = createFileRoute(
  "/(authed)/manage_/outsourcing-receipts_/create"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "outsourcing:create"),
  component: CreateOutsourcingReceiptPage,
})
