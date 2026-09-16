import { z } from "zod"

import { imageFieldSchema } from "@/lib/file-field.schema"
import { emptyToNull } from "@/lib/zod-transforms"

import { ItemStatus } from "@/lib/types/item.type"

// Wire contract for PATCH /api/items/:id — also the client-side onSubmit validator for
// UpdateConsumableForm (`code` is immutable after creation, so it's not part of this schema
// either; no `type` — this feature never changes an item's type away from CONSUMABLE). `consumableId`
// lives directly in the form's own state (the update flow's sections are its own components,
// not shared with CreateConsumableForm, so there's no withForm-invariance conflict), so
// mutationFn receives the form value as-is — no manual id merge at the call site. Deliberately
// shares no field definitions with create-consumable.schema.ts: on a PATCH an omitted key means
// "leave unchanged", not "not provided", so every optional field here transforms ""→null (an
// explicit clear) instead of ""→undefined — see UpdateItemReqDto's `nullable: true` fields on
// the backend. No `consumableGroupId`/`type` (INTERNAL/CLIENT) — both concepts were dropped when
// products+consumables merged into `items` (be-quanlysanxuat/docs/decisions/items-merge.md). No
// `attachments` — `consumable_attachments` was dropped too.
export const updateConsumableSchema = z.object({
  consumableId: z.uuid(),
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên vật tư")
    .max(255, "Tên vật tư tối đa 255 ký tự"),
  unitId: z.string().trim().min(1, "Vui lòng chọn đơn vị tính"),
  clientId: z.string().trim().transform(emptyToNull),
  image: imageFieldSchema,
  status: z.enum(ItemStatus),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToNull),

  // Extended information (all optional)
  supplierId: z.string().trim().transform(emptyToNull),
  // Unlike the other numeric/text fields below, minStock is NOT NULL DEFAULT 0 on the backend
  // (UpdateItemReqDto's minStock has no `nullable: true`, unlike specificWeight) — clearing the
  // input must send 0, not null, or the PATCH fails class-validator's NotEquals(null) check.
  minStock: z
    .number("Định mức tồn tối thiểu phải là số không âm")
    .min(0, "Định mức tồn tối thiểu phải là số không âm")
    .default(0),
  consumableGrade: z
    .string()
    .trim()
    .max(255, "Mác vật liệu tối đa 255 ký tự")
    .transform(emptyToNull),
  technicalStandard: z
    .string()
    .trim()
    .max(255, "Tiêu chuẩn kỹ thuật tối đa 255 ký tự")
    .transform(emptyToNull),
  dimensions: z
    .string()
    .trim()
    .max(255, "Kích thước / độ dày tối đa 255 ký tự")
    .transform(emptyToNull),
  specificWeight: z
    .number("Trọng lượng riêng phải là số không âm")
    .min(0, "Trọng lượng riêng phải là số không âm")
    .optional()
    .transform((value) => value ?? null),
  colorSurface: z
    .string()
    .trim()
    .max(255, "Màu sắc / bề mặt tối đa 255 ký tự")
    .transform(emptyToNull),
  description: z
    .string()
    .trim()
    .max(2000, "Mô tả chi tiết tối đa 2000 ký tự")
    .transform(emptyToNull),
  origin: z
    .string()
    .trim()
    .max(255, "Xuất xứ tối đa 255 ký tự")
    .transform(emptyToNull),
  leadTime: z
    .string()
    .trim()
    .max(100, "Thời gian giao hàng tối đa 100 ký tự")
    .transform(emptyToNull),
})

export type UpdateConsumableSchema = z.input<typeof updateConsumableSchema>

// Only used for withForm's type inference in the update flow's own sections — the real values
// always come from UpdateConsumableForm's own `defaultValues`, so placeholders here are harmless.
export const updateConsumableFormDefaultValues: UpdateConsumableSchema = {
  consumableId: "",
  name: "",
  unitId: "",
  clientId: "",
  image: null,
  status: ItemStatus.ACTIVE,
  note: "",
  supplierId: "",
  minStock: 0,
  consumableGrade: "",
  technicalStandard: "",
  dimensions: "",
  specificWeight: undefined,
  colorSurface: "",
  description: "",
  origin: "",
  leadTime: "",
}
