import { z } from "zod"

import { orderItemFormSchema } from "@/features/orders/schemas/order-item-form.schema"
import { fileFieldSchema } from "@/lib/file-field.schema"
import {
  emptyToNull,
  isNonNegativeNumberString,
  isPercentString,
  isPositiveNumberString,
  optionalEnumNullable,
  toIsoDate,
} from "@/lib/zod-transforms"

import {
  Currency,
  OrderDiscountType,
  OrderStatus,
  PaymentTerm,
} from "@/lib/types/order.type"

// Wire contract for PATCH /api/orders/:orderId — also the client-side onSubmit validator
// for UpdateOrderForm. `orderId` lives directly in the form's own state (the update flow's
// sections are its own components, not shared with CreateOrderForm, so there's no
// withForm-invariance conflict), so mutationFn receives the form value as-is — no manual id
// merge at the call site. Deliberately shares no field definitions with
// create-order.schema.ts: on a PATCH an omitted key means "leave unchanged", not "not
// provided", so every optional field here transforms ""→null (an explicit clear) instead of
// ""→undefined — see UpdateOrderReqDto's `nullable: true` fields on the backend. Also carries
// `status`, which CreateOrderReqDto has no field for (the backend defaults a new order to
// DRAFT). No contact snapshot fields — see create-order.schema.ts's comment.
export const updateOrderSchema = z.object({
  orderId: z.uuid(),
  clientId: z.string().trim().min(1, "Vui lòng chọn khách hàng"),
  assignedUserId: z.string().trim().transform(emptyToNull),
  orderDate: z
    .string()
    .min(1, "Vui lòng chọn ngày đặt hàng")
    .transform(toIsoDate),
  dueDate: z
    .string()
    .min(1, "Vui lòng chọn ngày giao hàng yêu cầu")
    .transform(toIsoDate),
  deliveryAddress: z
    .string()
    .trim()
    .max(500, "Địa chỉ tối đa 500 ký tự")
    .transform(emptyToNull),
  paymentTerm: optionalEnumNullable(PaymentTerm),
  currency: z.enum(Currency),
  exchangeRate: z
    .string()
    .trim()
    .refine(isPositiveNumberString, "Tỷ giá phải là số dương")
    .transform(Number),
  discountType: z.enum(OrderDiscountType),
  discountValue: z
    .string()
    .trim()
    .refine(isNonNegativeNumberString, "Chiết khấu không được âm")
    .transform(Number),
  vatPercent: z
    .string()
    .trim()
    .refine(isPercentString, "VAT phải trong khoảng 0-100")
    .transform(Number),
  shippingFee: z
    .string()
    .trim()
    .refine(isNonNegativeNumberString, "Phí vận chuyển không được âm")
    .transform(Number),
  // Only present on the update flow — CreateOrderReqDto has no field for it, the backend
  // defaults a new order to DRAFT.
  status: z.enum(OrderStatus),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToNull),
  internalNote: z
    .string()
    .trim()
    .max(1000, "Ghi chú nội bộ tối đa 1000 ký tự")
    .transform(emptyToNull),
  // Replace-all on the backend: an empty array clears the set, an omitted key keeps the
  // existing one. The form always sends both, so a save always replaces the full set.
  items: z.array(orderItemFormSchema),
  attachments: z.array(fileFieldSchema),
})

export type UpdateOrderSchema = z.input<typeof updateOrderSchema>

// Only used for withForm's type inference in the update flow's own sections — the real
// values always come from UpdateOrderForm's own `defaultValues`, so "" placeholders here are
// harmless.
export const updateOrderFormDefaultValues: UpdateOrderSchema = {
  orderId: "",
  clientId: "",
  assignedUserId: "",
  orderDate: "",
  dueDate: "",
  deliveryAddress: "",
  paymentTerm: "",
  currency: Currency.VND,
  exchangeRate: "1",
  discountType: OrderDiscountType.PERCENT,
  discountValue: "0",
  vatPercent: "0",
  shippingFee: "0",
  status: OrderStatus.DRAFT,
  note: "",
  internalNote: "",
  items: [],
  attachments: [],
}
