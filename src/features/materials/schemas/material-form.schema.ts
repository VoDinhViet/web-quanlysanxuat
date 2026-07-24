import { z } from "zod"

import { fileFieldSchema, imageFieldSchema } from "@/lib/file-field.schema"

import {
  MaterialStatus,
  MaterialType,
} from "@/features/materials/types/material.type"

// A blank form input means "not provided" — the wire payload should omit the
// field rather than send an empty string.
function emptyToUndefined(value: string): string | undefined {
  return value.length > 0 ? value : undefined
}

function emptyToUndefinedNumber(value: string): number | undefined {
  return value.length > 0 ? Number(value) : undefined
}

// type=CLIENT requires a client — mirrors the backend's resolveClientLink rule
// (MaterialsService, error code material.error.client_required).
export function refineMaterialClient(
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

// Wire contract for POST /api/materials (`code` is intentionally omitted here —
// the form never sets it; the backend auto-generates VTxxxx when omitted).
export const materialProfileFields = {
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
  preferredSupplierId: z.string().trim().transform(emptyToUndefined),
  leadTime: z
    .string()
    .trim()
    .max(100, "Thời gian giao hàng tối đa 100 ký tự")
    .transform(emptyToUndefined),
  attachments: z.array(fileFieldSchema),
}

export const materialFormSchema = z
  .object(materialProfileFields)
  .superRefine(refineMaterialClient)

export type MaterialFormSchema = z.input<typeof materialFormSchema>

export const MATERIAL_FORM_DEFAULT_VALUES: MaterialFormSchema = {
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
