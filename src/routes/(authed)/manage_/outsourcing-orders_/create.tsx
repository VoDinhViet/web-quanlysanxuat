import { createFileRoute } from "@tanstack/react-router"

import { CreateOutsourcingOrderPage } from "@/features/outsourcing-orders/pages/CreateOutsourcingOrderPage"

// No loader: mọi query (NCC, chi tiết có thể gia công) đều là useQuery ngay trong component, cùng
// lý do inventory-receipts_/create-from-po.tsx không prefetch gì trước.
export const Route = createFileRoute(
  "/(authed)/manage_/outsourcing-orders_/create"
)({
  component: CreateOutsourcingOrderPage,
})
