import { z } from "zod"

import {
  emptyToUndefined,
  emptyToUndefinedIsoDate,
  toIsoDate,
} from "@/lib/zod-transforms"

// Phiếu thủ công: người dùng tự nhập từng dòng, công đoạn chọn từ danh mục gia công ngoài và áp cho
// cả phiếu. Mirrors CreateStandaloneOutsourcingOrderReqDto.
const standaloneOutsourcingOrderItemSchema = z.object({
  itemCode: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã")
    .max(50, "Mã tối đa 50 ký tự"),
  itemName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên")
    .max(255, "Tên tối đa 255 ký tự"),
  unitId: z.string().trim().min(1, "Vui lòng chọn đơn vị"),
  quantity: z
    .number("SL gửi phải lớn hơn 0")
    .positive("SL gửi phải lớn hơn 0")
    .optional()
    .pipe(z.number("SL gửi phải lớn hơn 0")),
  weight: z
    .number("Trọng lượng phải là số ≥ 0")
    .min(0, "Trọng lượng phải là số ≥ 0")
    .optional(),
  area: z
    .number("Diện tích phải là số ≥ 0")
    .min(0, "Diện tích phải là số ≥ 0")
    .optional(),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự"),
})

export const standaloneOutsourcingOrderSchema = z
  .object({
    supplierId: z.string().trim().min(1, "Vui lòng chọn nhà cung cấp"),
    operationId: z.string().trim().min(1, "Vui lòng chọn công đoạn gia công"),
    sendDate: z.string().trim().min(1, "Vui lòng chọn ngày gửi đi"),
    expectedReturnDate: z.string().trim(),
    note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự"),
    items: z
      .array(standaloneOutsourcingOrderItemSchema)
      .min(1, "Cần ít nhất một dòng hàng gửi gia công"),
  })
  .refine(
    (value) =>
      !value.expectedReturnDate || value.expectedReturnDate >= value.sendDate,
    {
      message: "Ngày cần nhận về không được trước ngày gửi đi",
      path: ["expectedReturnDate"],
    }
  )
  .refine(
    (value) =>
      new Set(value.items.map((item) => item.itemCode)).size ===
      value.items.length,
    { message: "Mã hàng bị nhập trùng trong phiếu", path: ["items"] }
  )

export type StandaloneOutsourcingOrderSchema = z.input<
  typeof standaloneOutsourcingOrderSchema
>

export type StandaloneOutsourcingOrderItemValue =
  StandaloneOutsourcingOrderSchema["items"][number]

export const emptyStandaloneOutsourcingOrderItem: StandaloneOutsourcingOrderItemValue =
  {
    itemCode: "",
    itemName: "",
    unitId: "",
    quantity: undefined,
    weight: undefined,
    area: undefined,
    note: "",
  }

export const standaloneOutsourcingOrderFormDefaultValues: StandaloneOutsourcingOrderSchema =
  {
    supplierId: "",
    operationId: "",
    sendDate: "",
    expectedReturnDate: "",
    note: "",
    items: [emptyStandaloneOutsourcingOrderItem],
  }

// Wire payload: schema của form nối thêm bước đổi kiểu, cùng cách outsourcingOrderPayloadSchema.
export const standaloneOutsourcingOrderPayloadSchema =
  standaloneOutsourcingOrderSchema.transform(
    ({ sendDate, expectedReturnDate, note, items, ...rest }) => ({
      ...rest,
      sendDate: toIsoDate(sendDate),
      expectedReturnDate: emptyToUndefinedIsoDate(expectedReturnDate),
      note: emptyToUndefined(note),
      items: items.map((item) => ({
        ...item,
        note: emptyToUndefined(item.note),
      })),
    })
  )
