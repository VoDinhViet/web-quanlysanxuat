import { createFileRoute } from "@tanstack/react-router"

import { CreateInventoryReceiptPage } from "@/features/inventory-receipts/pages/CreateInventoryReceiptPage"

// No loader: mọi picker ở đây (kho, NCC, PO, vật tư) là combobox/select async qua useQuery —
// không có gì cần prefetch.
export const Route = createFileRoute(
  "/(authed)/manage_/inventory-receipts_/create"
)({
  component: CreateInventoryReceiptPage,
})
