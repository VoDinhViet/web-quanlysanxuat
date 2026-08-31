import { z } from "zod"

import { InventoryRequisitionType } from "@/lib/types/inventory-requisition.type"
import { emptyToNull, emptyToUndefined, toIsoDate } from "@/lib/zod-transforms"

// Snapshot dòng picker giữ trong form. Không chỉ để hiển thị: 2 `.refine` bên dưới đọc chính nó
// để chặn E231/E232 ngay trên client thay vì round-trip lên server. Gom một key thay vì rải phẳng
// (khác InventoryReceiptCreateFromPoItemsSchema's itemLabel/itemUnit/requestedQuantity) để chỗ
// strip ở validator (create-inventory-requisition.api.ts) là một dòng, và nhìn schema là biết
// ngay field nào lên wire.
const requisitionLineSnapshotSchema = z.object({
  itemCode: z.string(),
  itemName: z.string(),
  unitName: z.string(),
  bomQuantity: z.number().nullable(),
  issuedQuantity: z.number().nullable(),
  onHand: z.number(),
  reservedQuantity: z.number(),
  issuableQuantity: z.number(),
  availableQuantity: z.number(),
})

// = CreateInventoryRequisitionItemReqDto + `line` (snapshot UI-only, strip ở server function).
export const inventoryRequisitionItemFormSchema = z
  .object({
    itemId: z.uuid(),
    quantity: z
      .number("Vui lòng nhập SL lãnh")
      .positive("SL lãnh phải lớn hơn 0")
      .optional()
      .pipe(z.number("Vui lòng nhập SL lãnh")),
    note: z
      .string()
      .trim()
      .max(500, "Ghi chú tối đa 500 ký tự")
      .transform(emptyToNull),
    line: requisitionLineSnapshotSchema,
  })
  .refine((item) => item.quantity <= item.line.issuableQuantity, {
    message: "SL lãnh vượt SL có thể lãnh", // backend E231
    path: ["quantity"],
  })
  .refine(
    (item) =>
      item.line.bomQuantity === null ||
      item.quantity <=
        Math.max(0, item.line.bomQuantity - (item.line.issuedQuantity ?? 0)),
    { message: "SL lãnh vượt SL BOM còn lại", path: ["quantity"] } // backend E232
  )

export type InventoryRequisitionItemFormValue = z.input<
  typeof inventoryRequisitionItemFormSchema
>

// Wire contract for POST /api/inventory-requisitions — also the client-side onSubmit validator
// for CreateInventoryRequisitionForm. Field không bắt buộc dùng `emptyToUndefined` (POST —
// thiếu key nghĩa là "không nhập"); riêng `note` là `nullable: true` ở DTO nên dùng `emptyToNull`.
export const createInventoryRequisitionSchema = z
  .object({
    requisitionDate: z
      .string()
      .min(1, "Vui lòng chọn ngày lãnh")
      .transform(toIsoDate),
    type: z.enum(InventoryRequisitionType),
    departmentId: z.string().trim().transform(emptyToUndefined),
    productionOrderId: z.string().trim().transform(emptyToUndefined),
    productionJobId: z.string().trim().transform(emptyToUndefined),
    reason: z
      .string()
      .trim()
      .max(500, "Lý do tối đa 500 ký tự")
      .transform(emptyToUndefined),
    note: z
      .string()
      .trim()
      .max(1000, "Ghi chú tối đa 1000 ký tự")
      .transform(emptyToNull),
    items: z
      .array(inventoryRequisitionItemFormSchema)
      .min(1, "Phiếu cần ít nhất một dòng vật tư"),
  })
  .refine(
    (value) =>
      value.type !== InventoryRequisitionType.PRODUCTION ||
      Boolean(value.productionJobId),
    {
      message: "Vui lòng chọn Job cần lãnh vật tư", // backend E233
      path: ["productionJobId"],
    }
  )

export type CreateInventoryRequisitionSchema = z.input<
  typeof createInventoryRequisitionSchema
>

export const createInventoryRequisitionFormDefaultValues: CreateInventoryRequisitionSchema =
  {
    requisitionDate: "",
    type: InventoryRequisitionType.PRODUCTION,
    departmentId: "",
    productionOrderId: "",
    productionJobId: "",
    reason: "",
    note: "",
    items: [],
  }
