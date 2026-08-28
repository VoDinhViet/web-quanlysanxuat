import { createFileRoute } from "@tanstack/react-router"

import { InventoryReceiptCreateFromJobPage } from "@/features/inventory-receipts/pages/InventoryReceiptCreateFromJobPage"
import { createInventoryReceiptFromJobSearchSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt-from-job-search.schema"

// No loader: kho nhận, Job đều là combobox/select async qua useQuery — không có gì cần prefetch.
export const Route = createFileRoute(
  "/(authed)/manage_/inventory-receipts_/create-from-job"
)({
  validateSearch: createInventoryReceiptFromJobSearchSchema,
  component: InventoryReceiptCreateFromJobPage,
})
