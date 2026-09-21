import { z } from "zod"

// Real backend constraint: one purchase_order_items row maps 1:1 to a dòng ĐXMH
// (CreatePurchaseOrderItemReqDto.purchaseRequestItemId) — no allocation merge like RFQ's
// purchase_quotation_items, so picking a ledger row always adds its own picked-item row, never
// merges into an existing one. One form submit is exactly one POST /purchase-orders carrying the
// whole supplier + items payload.

// itemCode/itemName/unit/prCode/requestedQuantity are UI-only, carried so the picked table can
// re-render a row without a second fetch — same idiom as create-purchase-quotation.schema.ts's
// pickedQuotationItemFields. No neededDate here — the picked table has no use for it (the picker
// table shows it directly off the ledger row instead), unlike the other display fields below.
// No per-line `note` either — CreatePurchaseOrderItemReqDto accepts one, but the picked table has
// no cell to type it in, so it could only ever submit empty.
const pickedPurchaseOrderItemFields = {
  purchaseRequestItemId: z.string().trim().min(1),
  itemCode: z.string(),
  itemName: z.string(),
  unit: z.string(),
  prCode: z.string(),
  requestedQuantity: z.number(),
  quantity: z
    .number("Số lượng phải lớn hơn 0")
    .positive("Số lượng phải lớn hơn 0")
    .optional()
    .pipe(z.number("Số lượng phải lớn hơn 0")),
  unitPrice: z
    .number("Đơn giá không được âm")
    .min(0, "Đơn giá không được âm")
    .optional(),
  quantityAdjustmentReason: z
    .string()
    .trim()
    .max(500, "Lý do tối đa 500 ký tự"),
}

export const pickedPurchaseOrderItemSchema = z.object(
  pickedPurchaseOrderItemFields
)
export type PickedPurchaseOrderItemValue = z.input<
  typeof pickedPurchaseOrderItemSchema
>

export const createPurchaseOrderFormSchema = z.object({
  supplierId: z.string().trim().min(1, "Vui lòng chọn nhà cung cấp"),
  note: z.string().trim().max(1000, "Ghi chú tối đa 1000 ký tự"),
  items: z
    .array(pickedPurchaseOrderItemSchema)
    .min(1, "Chọn ít nhất 1 dòng đề xuất mua hàng"),
})

export type CreatePurchaseOrderFormSchema = z.input<
  typeof createPurchaseOrderFormSchema
>

export const createPurchaseOrderFormDefaultValues: CreatePurchaseOrderFormSchema =
  {
    supplierId: "",
    note: "",
    items: [],
  }
