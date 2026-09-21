import { createFileRoute } from "@tanstack/react-router"

import { CreateOutsourcingOrderPage } from "@/features/outsourcing-orders/pages/CreateOutsourcingOrderPage"
import { createOutsourcingOrderSearchSchema } from "@/features/outsourcing-orders/schemas/create-outsourcing-order-search.schema"

// No loader: mọi query (NCC, chi tiết có thể gia công) đều là useQuery ngay trong component, cùng
// lý do inventory-receipts_/create-from-po.tsx không prefetch gì trước. `validateSearch` chỉ để
// nhận deep-link productionJobId/operationId tuỳ chọn (vd từ nút "Gửi gia công ngoài" trên bảng
// công đoạn của 1 Job) — không có gì cần prefetch dựa trên chúng.
export const Route = createFileRoute(
  "/(authed)/manage_/outsourcing-orders_/create"
)({
  validateSearch: createOutsourcingOrderSearchSchema,
  component: CreateOutsourcingOrderPage,
})
