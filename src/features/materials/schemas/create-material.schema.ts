import { z } from "zod"

import { fileFieldSchema, imageFieldSchema } from "@/lib/file-field.schema"
import { emptyToUndefined, emptyToUndefinedNumber } from "@/lib/zod-transforms"

import { MaterialStatus, MaterialType } from "@/lib/types/material.type"

// type=CLIENT requires a client — mirrors the backend's resolveClientLink rule
// (MaterialsService, error code material.error.client_required).
function refineMaterialClient(
  value: { type: MaterialType; clientId?: string },
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

// Wire contract for POST /api/materials — also the client-side onSubmit validator for
// CreateMaterialForm (`code` is intentionally omitted — the form never sets it; the backend
// auto-generates VTxxxx when omitted). Every optional field transforms "" straight to undefined
// here, so the parsed value is already wire-ready — no separate mapping step. Deliberately
// shares no field definitions with update-material.schema.ts: the two flows evolve
// independently.
export const createMaterialSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập tên vật tư")
      .max(255, "Tên vật tư tối đa 255 ký tự"),
    unitId: z.string().trim().min(1, "Vui lòng chọn đơn vị tính"),
    materialGroupId: z.string().trim().min(1, "Vui lòng chọn nhóm vật tư"),
    type: z.enum(MaterialType),
    clientId: z.string().trim().transform(emptyToUndefined),
    image: imageFieldSchema,
    status: z.enum(MaterialStatus),
    note: z
      .string()
      .trim()
      .max(1000, "Ghi chú tối đa 1000 ký tự")
      .transform(emptyToUndefined),

    // Extended information (all optional)
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
        (value) =>
          value === undefined || (Number.isFinite(value) && value >= 0),
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
    // Not part of CreateMaterialReqDto — the backend's whitelist silently drops it, so this
    // field currently has no effect on save. Kept in the form/schema so the UI still renders
    // it; wire it up once the backend adds the field.
    preferredSupplierId: z.string().trim().transform(emptyToUndefined),
    leadTime: z
      .string()
      .trim()
      .max(100, "Thời gian giao hàng tối đa 100 ký tự")
      .transform(emptyToUndefined),
    attachments: z.array(fileFieldSchema),
  })
  .superRefine(refineMaterialClient)

export type CreateMaterialSchema = z.input<typeof createMaterialSchema>

export const createMaterialFormDefaultValues: CreateMaterialSchema = {
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
