import { z } from "zod"

import { fileFieldSchema } from "@/lib/file-field.schema"
import { emptyToUndefined, toIsoDate } from "@/lib/zod-transforms"
import {
  Currency,
  OrderDiscountType,
  OrderItemStatus,
  PaymentTerm,
} from "@/lib/types/order.type"

function isPositiveNumberString(value: string): boolean {
  const parsed = Number(value)
  return value.trim() !== "" && Number.isFinite(parsed) && parsed > 0
}

function isNonNegativeNumberString(value: string): boolean {
  const parsed = Number(value)
  return value.trim() !== "" && Number.isFinite(parsed) && parsed >= 0
}

function isPercentString(value: string): boolean {
  const parsed = Number(value)
  return (
    value.trim() !== "" &&
    Number.isFinite(parsed) &&
    parsed >= 0 &&
    parsed <= 100
  )
}

export const orderFields = {
  clientId: z.string().trim().min(1, "Vui lòng chọn khách hàng"),
  // Snapshot strings, not a contactId FK — see order.type.ts. The "Người liên
  // hệ" dropdown in OrderInfoSection only pre-fills these; still editable.
  contactName: z
    .string()
    .trim()
    .max(255, "Họ tên tối đa 255 ký tự")
    .transform(emptyToUndefined),
  contactPhone: z
    .string()
    .trim()
    .max(30, "Số điện thoại tối đa 30 ký tự")
    .transform(emptyToUndefined),
  contactEmail: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "Email không đúng định dạng"
    )
    .transform(emptyToUndefined),
  staffId: z.string().trim().transform(emptyToUndefined),
  orderDate: z
    .string()
    .min(1, "Vui lòng chọn ngày đặt hàng")
    .transform(toIsoDate),
  // Required even though the DB column is nullable — CreateOrderReqDto declares
  // it non-optional (see be-quanlysanxuat create-order.req.dto.ts).
  dueDate: z
    .string()
    .min(1, "Vui lòng chọn ngày giao hàng yêu cầu")
    .transform(toIsoDate),
  deliveryAddress: z
    .string()
    .trim()
    .max(500, "Địa chỉ tối đa 500 ký tự")
    .transform(emptyToUndefined),
  paymentTerm: z
    .union([z.enum(PaymentTerm), z.literal("")])
    .transform((value) => (value === "" ? undefined : value)),
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
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToUndefined),
  internalNote: z
    .string()
    .trim()
    .max(1000, "Ghi chú nội bộ tối đa 1000 ký tự")
    .transform(emptyToUndefined),
}

// One order line. Kept as a single raw schema (no empty->undefined/number
// transforms) — unlike orderFields above, this doubles as the live row-editing
// state (`OrderItemFormValue`, via z.infer) for the items table and its add/
// edit dialog, so every field must stay a plain string. The string->number and
// empty->undefined mapping for the wire payload happens once, in
// create-order.ts's item-level `.transform()`.
export const orderItemFormFields = {
  productId: z.string().trim().min(1, "Vui lòng chọn sản phẩm"),
  // UI-only — re-displayed in the items table without a second product fetch;
  // stripped before the payload reaches create-order.ts's .transform().
  productLabel: z.string(),
  productUnit: z.string(),
  quantity: z
    .string()
    .trim()
    .refine(isPositiveNumberString, "Số lượng phải lớn hơn 0"),
  unitPrice: z
    .string()
    .trim()
    .refine(isNonNegativeNumberString, "Đơn giá không được âm"),
  discountPercent: z
    .string()
    .trim()
    .refine(isPercentString, "Chiết khấu phải trong khoảng 0-100"),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự"),
  status: z.enum(OrderItemStatus),
}

export const orderItemFormSchema = z.object(orderItemFormFields)

export type OrderItemFormValue = z.infer<typeof orderItemFormSchema>

export const ORDER_ITEM_DEFAULT_VALUE: OrderItemFormValue = {
  productId: "",
  productLabel: "",
  productUnit: "",
  quantity: "1",
  unitPrice: "0",
  discountPercent: "0",
  note: "",
  status: OrderItemStatus.NORMAL,
}

// Raw form fields shared by the create order form and its client-side
// validator (`onSubmit`) — used as-is, since there's no order-update screen
// yet (see create-order.schema.ts).
export const orderFormSchema = z.object({
  ...orderFields,
  items: z.array(orderItemFormSchema),
  attachments: z.array(fileFieldSchema),
})

export type OrderFormSchema = z.input<typeof orderFormSchema>

export const ORDER_FORM_DEFAULT_VALUES: OrderFormSchema = {
  clientId: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  staffId: "",
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
  note: "",
  internalNote: "",
  items: [],
  attachments: [],
}
