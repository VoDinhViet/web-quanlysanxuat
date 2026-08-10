import { DateTime } from "luxon"
import { z } from "zod"

import {
  emptyToUndefined,
  emptyToUndefinedNumber,
  isNonNegativeNumberString,
  isPositiveNumberString,
} from "@/lib/zod-transforms"

// Real backend constraint: one purchase_quotations row is tied to exactly one supplier
// (CreateQuotationReqDto). Suppliers are chosen per vật tư — item A might be quoted by NCC 1+2,
// item B only by NCC 3 — so buildQuotationPayload() below fans out per supplier ID appearing
// ANYWHERE across all items (collectQuotationSuppliers), each payload only carrying the items
// that actually listed that supplier. The fan-out itself happens in CreateQuotationForm's
// mutationFn, not here. No quotationDate/validUntil/note fields on the form (per product
// decision) — quotationDate is required on the wire, so buildQuotationPayload stamps it with
// "now" at submit time instead of asking the user to pick it; validUntil/note are optional on
// the wire and just aren't sent.

// unitPrice/leadTimeDays are optional even when a supplier is added to an item — an RFQ can be
// created before that supplier has actually quoted (DRAFT), same as leaving a cell blank.
const optionalNonNegativeNumberString = z
  .string()
  .trim()
  .refine((value) => value === "" || isNonNegativeNumberString(value), {
    message: "Giá trị không được âm",
  })

// One (vật tư, NCC) pairing — supplierLabel is UI-only, carried alongside supplierId the same
// way OrderItemFormValue carries itemLabel, so a row re-renders without a second suppliers fetch.
// lastPrice/lastPurchaseDate are reference-only: no purchase-history API exists to fetch them
// from (confirmed — be-quanlysanxuat has no such endpoint), so the buyer types them in from
// memory/records if known. Neither is part of CreateQuotationItemReqDto, so
// buildQuotationPayload() below never reads them — purely local, never sent.
const quotationSupplierQuoteFields = {
  supplierId: z.string().trim().min(1, "Vui lòng chọn NCC"),
  supplierLabel: z.string(),
  lastPrice: optionalNonNegativeNumberString,
  lastPurchaseDate: z.string(),
  unitPrice: optionalNonNegativeNumberString,
  leadTimeDays: optionalNonNegativeNumberString,
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự"),
}

export const quotationSupplierQuoteSchema = z.object(
  quotationSupplierQuoteFields
)
export type QuotationSupplierQuoteValue = z.input<
  typeof quotationSupplierQuoteSchema
>

// Display fields (prCode/itemCode/itemName/unit/requestedQuantity/neededDate) are UI-only,
// carried so the compare table can re-render a row without a second fetch — same idiom as
// orderItemFormSchema's itemLabel/itemUnit. `quotes` is this item's OWN supplier list — adding a
// supplier to one item never touches any other item's list.
const pickedQuotationItemFields = {
  purchaseRequestItemId: z.string().trim().min(1),
  prCode: z.string(),
  itemCode: z.string(),
  itemName: z.string(),
  unit: z.string(),
  requestedQuantity: z.number(),
  neededDate: z.string(),
  // Named `quantity`, not e.g. `declaredQuantity` — matches CreateQuotationItemReqDto's own field
  // name 1:1 (no rename to map back out at payload-build time). Defaults to requestedQuantity,
  // editable.
  quantity: z
    .string()
    .trim()
    .refine(isPositiveNumberString, "Số lượng phải lớn hơn 0"),
  // Display-only, same reasoning as lastPrice/lastPurchaseDate above — CreateQuotationItemReqDto
  // has one `note` per (item, NCC) line already used by quotes[].note, no separate slot for a
  // quantity-adjustment reason, so this never reaches buildQuotationPayload()'s output either.
  adjustmentReason: z.string().trim().max(500, "Lý do tối đa 500 ký tự"),
  quotes: z.array(quotationSupplierQuoteSchema),
}

export const pickedQuotationItemSchema = z
  .object(pickedQuotationItemFields)
  .refine(
    (item) =>
      new Set(item.quotes.map((quote) => quote.supplierId)).size ===
      item.quotes.length,
    { message: "Một NCC chỉ được chọn 1 lần cho mỗi vật tư", path: ["quotes"] }
  )

export type PickedQuotationItemValue = z.input<typeof pickedQuotationItemSchema>

export const createQuotationFormSchema = z
  .object({
    items: z
      .array(pickedQuotationItemSchema)
      .min(1, "Chọn ít nhất 1 vật tư cần báo giá"),
  })
  .refine((value) => value.items.some((item) => item.quotes.length > 0), {
    message: "Thêm ít nhất 1 NCC cho một vật tư bất kỳ",
    path: ["items"],
  })

export type CreateQuotationFormSchema = z.input<
  typeof createQuotationFormSchema
>

export const createQuotationFormDefaultValues: CreateQuotationFormSchema = {
  items: [],
}

// Wire shape for POST /api/purchase-quotations — matches CreateQuotationReqDto exactly.
export type CreateQuotationPayload = {
  supplierId: string
  quotationDate: string
  validUntil?: string
  note?: string
  items: {
    purchaseRequestItemId: string
    quantity: number
    unitPrice?: number
    leadTimeDays?: number
    note?: string
  }[]
}

// Every distinct supplier appearing across any item's `quotes`, in first-seen order — the set of
// payloads CreateQuotationForm's mutationFn fans out to, one buildQuotationPayload() call each.
export function collectQuotationSuppliers(
  value: CreateQuotationFormSchema
): { supplierId: string; supplierLabel: string }[] {
  const bySupplierId = new Map<string, string>()

  for (const item of value.items) {
    for (const quote of item.quotes) {
      if (quote.supplierId && !bySupplierId.has(quote.supplierId)) {
        bySupplierId.set(quote.supplierId, quote.supplierLabel)
      }
    }
  }

  return Array.from(bySupplierId, ([supplierId, supplierLabel]) => ({
    supplierId,
    supplierLabel,
  }))
}

// Called once per supplier from collectQuotationSuppliers() above — only items that actually
// listed this supplier make it into the payload (flatMap drops the rest), converting every string
// field the same way any other create schema would (emptyToUndefined*). quotationDate is required
// on the wire but not user-editable here, so it's stamped with "now" at call time —
// DateTime.now() types as DateTime<true> (always valid), so .toISO() is non-nullable.
export function buildQuotationPayload(
  value: CreateQuotationFormSchema,
  supplierId: string
): CreateQuotationPayload {
  return {
    supplierId,
    quotationDate: DateTime.now().toISO(),
    items: value.items.flatMap((item) => {
      const quote = item.quotes.find((q) => q.supplierId === supplierId)
      if (!quote) return []

      return [
        {
          purchaseRequestItemId: item.purchaseRequestItemId,
          quantity: Number(item.quantity),
          unitPrice: emptyToUndefinedNumber(quote.unitPrice),
          leadTimeDays: emptyToUndefinedNumber(quote.leadTimeDays),
          note: emptyToUndefined(quote.note),
        },
      ]
    }),
  }
}
