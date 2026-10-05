import { z } from "zod"

// Wire contract for POST /api/purchase-quotations/:quotationId/approve — one selected NCC per
// item, all items required in a single request (the backend rejects a partial selection with
// purchase_quotation.error.supplier_not_selected).
export const approvePurchaseQuotationSchema = z.object({
  purchaseQuotationId: z.uuid(),
  selectedSuppliers: z
    .array(
      z.object({
        quotationItemId: z.uuid(),
        quotationItemSupplierId: z.uuid(),
      })
    )
    .min(1, "Cần chọn NCC thắng thầu cho ít nhất 1 vật tư"),
})

export type ApprovePurchaseQuotationSchema = z.infer<
  typeof approvePurchaseQuotationSchema
>
