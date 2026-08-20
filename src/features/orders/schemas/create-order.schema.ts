import { z } from "zod"

import { orderItemFormSchema } from "@/features/orders/schemas/order-item-form.schema"
import { fileFieldSchema } from "@/lib/file-field.schema"
import {
  emptyToUndefined,
  isNonNegativeNumberString,
  isPercentString,
  isPositiveNumberString,
  optionalEnum,
  toIsoDate,
} from "@/lib/zod-transforms"

import {
  Currency,
  OrderDiscountType,
  PaymentTerm,
} from "@/lib/types/order.type"

// Wire contract for POST /api/orders — also the client-side onSubmit validator for
// CreateOrderForm. Every optional field transforms "" straight to undefined here, so the
// parsed value is already wire-ready — no separate mapping step. Deliberately shares no
// field definitions with update-order.schema.ts: on a PATCH, an omitted key means "leave
// unchanged" rather than "not provided", so the two flows need different empty-string
// transforms (undefined here vs. null there) and must evolve independently. No contact
// snapshot fields — the backend dropped `contactName`/`contactPhone`/`contactEmail`; contact
// info now reads through `clientId` instead (see order.type.ts's `OrderClientRef`).
export const createOrderSchema = z.object({
  clientId: z.string().trim().min(1, "Vui lòng chọn khách hàng"),
  assignedUserId: z.string().trim().transform(emptyToUndefined),
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
  consigneeAddress: z
    .string()
    .trim()
    .max(500, "Địa chỉ tối đa 500 ký tự")
    .transform(emptyToUndefined),
  paymentTerm: optionalEnum(PaymentTerm),
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
  items: z.array(orderItemFormSchema),
  attachments: z.array(fileFieldSchema),
})

export type CreateOrderSchema = z.input<typeof createOrderSchema>

export const createOrderFormDefaultValues: CreateOrderSchema = {
  clientId: "",
  assignedUserId: "",
  orderDate: "",
  dueDate: "",
  consigneeAddress: "",
  paymentTerm: PaymentTerm.IMMEDIATE,
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
