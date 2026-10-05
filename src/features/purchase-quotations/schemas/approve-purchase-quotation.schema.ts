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
  // Duyệt một phần: chỉ gửi dòng bị giảm SL (kèm lý do bắt buộc); bỏ trống = duyệt nguyên SL.
  allocations: z
    .array(
      z.object({
        allocationId: z.uuid(),
        quantity: z.number().positive(),
        reason: z.string().trim().min(1).max(400),
      })
    )
    .optional(),
})

export type ApprovePurchaseQuotationSchema = z.infer<
  typeof approvePurchaseQuotationSchema
>
