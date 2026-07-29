import { z } from "zod"

import { fileFieldSchema, imageFieldSchema } from "@/lib/file-field.schema"
import { emptyToNull, emptyToUndefined } from "@/lib/zod-transforms"

import { MaterialStatus, MaterialType } from "@/lib/types/material.type"

// type=CLIENT requires a client — mirrors the backend's resolveClientLink rule
// (MaterialsService, error code material.error.client_required).
function refineMaterialClient(
  value: { type: MaterialType; clientId?: string | null },
  ctx: z.RefinementCtx
): void {
  if (value.type === MaterialType.CLIENT && !value.clientId) {
    ctx.addIssue({
      code: "custom",
      path: ["clientId"],
      message: "Vui lòng chọn khách hàng",
    })
  }
}

// Wire contract for PATCH /api/materials/:id — also the client-side onSubmit validator for
// UpdateMaterialForm (`code` is immutable after creation, so it's not part of this schema
// either). `materialId` lives directly in the form's own state (the update flow's sections are
// its own components, not shared with CreateMaterialForm, so there's no withForm-invariance
// conflict), so mutationFn receives the form value as-is — no manual id merge at the call site.
// Deliberately shares no field definitions with create-material.schema.ts: on a PATCH an omitted
// key means "leave unchanged", not "not provided", so every optional field here transforms
// ""→null (an explicit clear) instead of ""→undefined — see UpdateMaterialReqDto's
// `nullable: true` fields on the backend.
export const updateMaterialSchema = z
  .object({
    materialId: z.uuid(),
    name: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập tên vật tư")
      .max(255, "Tên vật tư tối đa 255 ký tự"),
    unitId: z.string().trim().min(1, "Vui lòng chọn đơn vị tính"),
    materialGroupId: z.string().trim().min(1, "Vui lòng chọn nhóm vật tư"),
    type: z.enum(MaterialType),
    clientId: z.string().trim().transform(emptyToNull),
    image: imageFieldSchema,
    status: z.enum(MaterialStatus),
    note: z
      .string()
      .trim()
      .max(1000, "Ghi chú tối đa 1000 ký tự")
      .transform(emptyToNull),

    // Extended information (all optional)
    materialGrade: z
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
      .string()
      .trim()
      .transform((value) => (value.length > 0 ? Number(value) : null))
      .refine(
        (value) => value === null || (Number.isFinite(value) && value >= 0),
        { message: "Trọng lượng riêng phải là số không âm" }
      ),
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
    // Not part of UpdateMaterialReqDto — the backend's whitelist silently drops it, so this
    // field currently has no effect on save. Kept in the form/schema so the UI still renders
    // it; wire it up once the backend adds the field.
    preferredSupplierId: z.string().trim().transform(emptyToUndefined),
    leadTime: z
      .string()
      .trim()
      .max(100, "Thời gian giao hàng tối đa 100 ký tự")
      .transform(emptyToNull),
    attachments: z.array(fileFieldSchema),
  })
  .superRefine(refineMaterialClient)

export type UpdateMaterialSchema = z.input<typeof updateMaterialSchema>

// Only used for withForm's type inference in the update flow's own sections — the real values
// always come from UpdateMaterialForm's own `defaultValues`, so placeholders here are harmless.
export const updateMaterialFormDefaultValues: UpdateMaterialSchema = {
  materialId: "",
  name: "",
  unitId: "",
  materialGroupId: "",
  type: MaterialType.INTERNAL,
  clientId: "",
  image: null,
  status: MaterialStatus.ACTIVE,
  note: "",
  materialGrade: "",
  technicalStandard: "",
  dimensions: "",
  specificWeight: "",
  colorSurface: "",
  description: "",
  origin: "",
  preferredSupplierId: "",
  leadTime: "",
  attachments: [],
}
