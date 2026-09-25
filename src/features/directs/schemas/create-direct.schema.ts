import { z } from "zod"

import { imageFieldSchema } from "@/lib/file-field.schema"
import { emptyToUndefined } from "@/lib/zod-transforms"

import { ItemStatus } from "@/lib/types/item.type"

// Wire contract for POST /api/items (`type` fixed to "DIRECT" by the server function, not a form
// field) — also the client-side onSubmit validator for CreateDirectForm (`code` is
// user-entered and required; the backend 409s on a duplicate code + revision). Every optional field transforms "" straight to undefined here, so the parsed value
// is already wire-ready — no separate mapping step. Deliberately shares no field definitions
// with update-direct.schema.ts: the two flows evolve independently. No `directGroupId`/
// `type` (INTERNAL/CLIENT) — both concepts were dropped when products+directs merged into
// `items` (be-quanlysanxuat/docs/decisions/items-merge.md), taking the "CLIENT requires a
// client" rule with them. No `attachments` — `direct_attachments` was dropped too.
export const createDirectSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã vật tư")
    .max(50, "Mã vật tư tối đa 50 ký tự"),
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên vật tư")
    .max(255, "Tên vật tư tối đa 255 ký tự"),
  unitId: z.string().trim().min(1, "Vui lòng chọn đơn vị tính"),
  clientId: z.string().trim().transform(emptyToUndefined),
  image: imageFieldSchema,
  status: z.enum(ItemStatus),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToUndefined),

  // Extended information (all optional)
  supplierId: z.string().trim().transform(emptyToUndefined),
  minStock: z
    .number("Định mức tồn tối thiểu phải là số không âm")
    .min(0, "Định mức tồn tối thiểu phải là số không âm")
    .optional(),
  directGrade: z
    .string()
    .trim()
    .max(255, "Mác vật liệu tối đa 255 ký tự")
    .transform(emptyToUndefined),
  technicalStandard: z
    .string()
    .trim()
    .max(255, "Tiêu chuẩn kỹ thuật tối đa 255 ký tự")
    .transform(emptyToUndefined),
  dimensions: z
    .string()
    .trim()
    .max(255, "Kích thước / độ dày tối đa 255 ký tự")
    .transform(emptyToUndefined),
  specificWeight: z
    .number("Trọng lượng riêng phải là số không âm")
    .min(0, "Trọng lượng riêng phải là số không âm")
    .optional(),
  colorSurface: z
    .string()
    .trim()
    .max(255, "Màu sắc / bề mặt tối đa 255 ký tự")
    .transform(emptyToUndefined),
  description: z
    .string()
    .trim()
    .max(2000, "Mô tả chi tiết tối đa 2000 ký tự")
    .transform(emptyToUndefined),
  origin: z
    .string()
    .trim()
    .max(255, "Xuất xứ tối đa 255 ký tự")
    .transform(emptyToUndefined),
  leadTime: z
    .string()
    .trim()
    .max(100, "Thời gian giao hàng tối đa 100 ký tự")
    .transform(emptyToUndefined),
})

export type CreateDirectSchema = z.input<typeof createDirectSchema>

export const createDirectFormDefaultValues: CreateDirectSchema = {
  code: "",
  name: "",
  unitId: "",
  clientId: "",
  image: null,
  status: ItemStatus.ACTIVE,
  note: "",
  supplierId: "",
  minStock: undefined,
  directGrade: "",
  technicalStandard: "",
  dimensions: "",
  specificWeight: undefined,
  colorSurface: "",
  description: "",
  origin: "",
  leadTime: "",
}
