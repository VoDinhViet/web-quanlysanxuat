import { z } from "zod"

import { PurchaseOrderProgress } from "@/lib/types/purchase-order.type"

// `z.iso.date()` validates the URL's "yyyy-MM-dd" strictly (a stray datetime or garbage string
// degrades to `undefined` via `.catch()`) but keeps the field a `string` — TanStack Router's
// search updater (`search: (prev) => ({...prev, x})`) requires the return value to match the
// schema's *input* type, so coercing to `Date` here would break every navigate handler on this
// route, not just the date ones. DateRangePicker works in `Date` (react-day-picker), so
// PurchaseOrdersTableFilter.tsx converts locally with `parseISO()`/`format()`. Named
// `progress`/`startDate`/`endDate` to match GetPurchaseOrdersReqDto 1:1 — no wire rename needed
// in the server function.
export const purchaseOrdersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  progress: z.enum(PurchaseOrderProgress).optional().catch(undefined),
  supplierId: z.string().trim().min(1).optional().catch(undefined),
  startDate: z.iso.date().optional().catch(undefined),
  endDate: z.iso.date().optional().catch(undefined),
  // Independent from `progress` (matches GetPurchaseOrdersReqDto.hasRemainingReceipt) — PO đã
  // ORDERED và còn hàng chưa nhập đủ (progress ORDERED hoặc RECEIVING). Chưa dùng ở trang danh
  // sách PO (route ở đó không set field này); dùng bởi bước chọn PO của
  // inventory-receipts/components/create-from-po/InventoryReceiptCreateFromPoPickerSection.tsx
  // để chỉ liệt kê PO còn cần nhập kho.
  hasRemainingReceipt: z.boolean().optional().catch(undefined),
})

export type PurchaseOrdersSearchSchema = z.infer<
  typeof purchaseOrdersSearchSchema
>
