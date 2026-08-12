import { z } from "zod"

import { imageFieldSchema } from "@/lib/file-field.schema"
import { emptyToUndefined, emptyToUndefinedNumber } from "@/lib/zod-transforms"

import { ItemStatus } from "@/lib/types/item.type"

// Wire contract for POST /api/items (`type` fixed to "RM" by the server function, not a form
// field) — also the client-side onSubmit validator for CreateMaterialForm (`code` is
// intentionally omitted — the form never sets it; the backend auto-generates VTxxxx when
// omitted). Every optional field transforms "" straight to undefined here, so the parsed value
// is already wire-ready — no separate mapping step. Deliberately shares no field definitions
// with update-material.schema.ts: the two flows evolve independently. No `materialGroupId`/
// `type` (INTERNAL/CLIENT) — both concepts were dropped when products+materials merged into
// `items` (be-quanlysanxuat/docs/decisions/items-merge.md), taking the "CLIENT requires a
// client" rule with them. No `attachments` — `material_attachments` was dropped too.
export const createMaterialSchema = z.object({
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
    .string()
    .trim()
    .transform(emptyToUndefinedNumber)
    .refine(
      (value) => value === undefined || (Number.isFinite(value) && value >= 0),
      { message: "Định mức tồn tối thiểu phải là số không âm" }
    ),
  materialGrade: z
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
    .string()
    .trim()
    .transform(emptyToUndefinedNumber)
    .refine(
      (value) => value === undefined || (Number.isFinite(value) && value >= 0),
      { message: "Trọng lượng riêng phải là số không âm" }
    ),
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

export type CreateMaterialSchema = z.input<typeof createMaterialSchema>

export const createMaterialFormDefaultValues: CreateMaterialSchema = {
  name: "",
  unitId: "",
  clientId: "",
  image: null,
  status: ItemStatus.ACTIVE,
  note: "",
  supplierId: "",
  minStock: "",
  materialGrade: "",
  technicalStandard: "",
  dimensions: "",
  specificWeight: "",
  colorSurface: "",
  description: "",
  origin: "",
  leadTime: "",
}
