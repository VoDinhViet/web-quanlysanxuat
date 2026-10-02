import { z } from "zod"

// Wire contract for POST /api/purchase-orders/:purchaseOrderId/cancel — shared by
// PurchaseOrderCancelDialog's form and the server function's validator, same 1000-char cap as
// reject-purchase-quotation.schema.ts.
export const cancelPurchaseOrderSchema = z.object({
  purchaseOrderId: z.uuid(),
  reason: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do huỷ")
    .max(1000, "Lý do tối đa 1000 ký tự"),
  // true → the backend also moves the source RFQ APPROVED → DRAFT so the price can be fixed and
  // the quotation re-approved (regenerates POs). Omitted/false → only the PO is cancelled.
  reopenQuotation: z.boolean().optional(),
})

export type CancelPurchaseOrderSchema = z.infer<
  typeof cancelPurchaseOrderSchema
>
