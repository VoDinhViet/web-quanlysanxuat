import { z } from "zod"

// Real backend constraint: one purchase_quotations row can carry any number of vật tư, and each
// vật tư line can carry any number of NCC (`suppliers`) — quantity lives once per item,
// unitPrice/leadTimeDays/note live once per (item, NCC) pair
// (CreateQuotationItemReqDto/CreateQuotationItemSupplierReqDto). One form submit is exactly one
// POST /purchase-quotations carrying the whole item→suppliers tree — no per-supplier fan-out.

// unitPrice/leadTimeDays are optional even when a supplier is added to an item — an RFQ can be
// created before that supplier has actually quoted (DRAFT), same as leaving a cell blank.
// One (vật tư, NCC) pairing — supplierLabel is UI-only, carried alongside supplierId the same
// way OrderItemFormValue carries itemLabel, so a row re-renders without a second suppliers fetch.
// lastPrice/lastPurchaseDate are reference-only: automatically populated from purchase history.
const quotationItemSupplierFields = {
  supplierId: z.string().trim().min(1, "Vui lòng chọn NCC"),
  supplierLabel: z.string(),
  lastPrice: z.number().min(0, "Giá gần nhất không được âm").optional(),
  lastPurchaseDate: z.string(),
  unitPrice: z
    .number("Vui lòng nhập giá báo")
    .min(0, "Giá báo không được âm")
    .optional()
    .pipe(z.number("Vui lòng nhập giá báo")),
  leadTimeDays: z.number().min(0, "Leadtime không được âm").optional(),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự"),
}

export const quotationItemSupplierSchema = z.object(quotationItemSupplierFields)
export type QuotationItemSupplierValue = z.input<
  typeof quotationItemSupplierSchema
>

// One dòng ĐXMH nguồn merged into a vật tư line — prCode/requestedQuantity/neededDate are
// UI-only, same idiom as pickedQuotationItemFields's own display fields below. Named `quantity`/
// `quantityAdjustmentReason` 1:1 matching CreateQuotationItemAllocationReqDto's own field names —
// no rename to map back out at payload-build time.
const quotationItemAllocationFields = {
  purchaseRequestItemId: z.string().trim().min(1),
  prCode: z.string(),
  requestedQuantity: z.number(),
  neededDate: z.string(),
  quantity: z
    .number("Số lượng phải lớn hơn 0")
    .positive("Số lượng phải lớn hơn 0")
    .optional()
    .pipe(z.number("Số lượng phải lớn hơn 0")),
  quantityAdjustmentReason: z
    .string()
    .trim()
    .max(500, "Lý do tối đa 500 ký tự"),
}

export const quotationItemAllocationSchema = z
  .object(quotationItemAllocationFields)
  .refine(
    (data) =>
      data.quantity === undefined ||
      data.requestedQuantity === undefined ||
      data.quantity <= data.requestedQuantity,
    {
      message: "Số lượng báo giá không được lớn hơn số lượng cần mua",
      path: ["quantity"],
    }
  )
export type QuotationItemAllocationValue = z.input<
  typeof quotationItemAllocationSchema
>

// Display fields (itemCode/itemName/unit) are UI-only, carried so the compare table can re-render
// a row without a second fetch — same idiom as orderItemFormSchema's itemLabel/itemUnit.
// `allocations` is every dòng ĐXMH merged into this vật tư (picking two ledger rows with the same
// itemId appends a second allocation instead of a second item — see
// CreateQuotationItemsPickerSection.tsx's toggleRow). `suppliers` is this item's OWN NCC list —
// adding a supplier to one item never touches any other item's list.
const pickedQuotationItemFields = {
  itemId: z.string().trim().min(1),
  itemCode: z.string(),
  itemName: z.string(),
  unit: z.string(),
  allocations: z.array(quotationItemAllocationSchema).min(1),
  suppliers: z.array(quotationItemSupplierSchema),
}

export const pickedQuotationItemSchema = z
  .object(pickedQuotationItemFields)
  .refine(
    (item) =>
      new Set(item.suppliers.map((supplier) => supplier.supplierId)).size ===
      item.suppliers.length,
    {
      message: "Một NCC chỉ được chọn 1 lần cho mỗi vật tư",
      path: ["suppliers"],
    }
  )

export type PickedQuotationItemValue = z.input<typeof pickedQuotationItemSchema>

export const createQuotationFormSchema = z
  .object({
    items: z
      .array(pickedQuotationItemSchema)
      .min(1, "Chọn ít nhất 1 vật tư cần báo giá"),
  })
  .refine((value) => value.items.some((item) => item.suppliers.length > 0), {
    message: "Thêm ít nhất 1 NCC cho một vật tư bất kỳ",
    path: ["items"],
  })

import type { PurchaseQuotationDetail } from "@/lib/types/purchase-quotation.type"

export type CreateQuotationFormSchema = z.input<
  typeof createQuotationFormSchema
>

export const createQuotationFormDefaultValues: CreateQuotationFormSchema = {
  items: [],
}

export function mapQuotationDetailToFormValues(
  quotation: PurchaseQuotationDetail
): CreateQuotationFormSchema {
  return {
    items: quotation.items.map((item) => ({
      itemId: item.item.id,
      itemCode: item.item.code,
      itemName: item.item.name,
      unit: item.item.unit.name,
      allocations: item.allocations.map((allocation) => ({
        purchaseRequestItemId: allocation.purchaseRequestItem.id,
        prCode: allocation.purchaseRequestItem.purchaseRequest.code,
        requestedQuantity: allocation.purchaseRequestItem.quantity,
        neededDate: "",
        quantity: allocation.quantity,
        quantityAdjustmentReason: allocation.quantityAdjustmentReason ?? "",
      })),
      suppliers: item.suppliers.map((supplier) => ({
        supplierId: supplier.supplier.id,
        supplierLabel: `${supplier.supplier.name} (${supplier.supplier.code})`,
        lastPrice: supplier.lastPurchase?.unitPrice,
        lastPurchaseDate: supplier.lastPurchase?.orderDate ?? "",
        unitPrice: supplier.unitPrice ?? undefined,
        leadTimeDays: supplier.leadTimeDays ?? undefined,
        note: supplier.note ?? "",
      })),
    })),
  }
}

