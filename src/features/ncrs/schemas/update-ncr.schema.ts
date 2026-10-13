import { z } from "zod"

import type { NcrDetail } from "@/lib/types/ncr.type"
import { emptyToUndefined } from "@/lib/zod-transforms"

const analysisText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `Tối đa ${maxLength} ký tự`)
    .transform(emptyToUndefined)

// Wire contract for PATCH /api/ncrs/:ncrId — the "Lưu" button of the NCR analysis form. Only
// valid while the NCR is OPEN/REJECTED. SL còn lại (ngQty − sửa − làm mới) chỉ ghi nhận.
export const updateNcrSchema = z
  .object({
    ncrId: z.uuid(),
    defectDescription: analysisText(1000),
    rootCause: analysisText(2000),
    correctiveAction: analysisText(2000),
    preventiveAction: analysisText(2000),
    departmentId: z.string().trim().transform(emptyToUndefined),
    ngQty: z.number().min(0, "SL không được âm"),
    reworkQty: z.number().min(0, "SL không được âm"),
    remakeQty: z.number().min(0, "SL không được âm"),
    reworkOperationIds: z.array(z.uuid()),
  })
  .superRefine((value, ctx) => {
    if (value.reworkQty + value.remakeQty > value.ngQty) {
      ctx.addIssue({
        code: "custom",
        path: ["reworkQty"],
        message: "SL sửa chữa + làm mới không được vượt SL hàng lỗi",
      })
    }
  })

export type UpdateNcrSchema = z.input<typeof updateNcrSchema>

// The form's value type is hand-written: the number fields are typed `number | undefined` by
// the NumberField kit, so the form seeds them with the saved numbers and the schema re-checks.
export type UpdateNcrFormValue = {
  ncrId: string
  defectDescription: string
  rootCause: string
  correctiveAction: string
  preventiveAction: string
  departmentId: string
  ngQty: number
  reworkQty: number
  remakeQty: number
  reworkOperationIds: string[]
}

export function getNcrDefaultValues(ncr: NcrDetail): UpdateNcrFormValue {
  return {
    ncrId: ncr.id,
    defectDescription: ncr.defectDescription ?? "",
    rootCause: ncr.rootCause ?? "",
    correctiveAction: ncr.correctiveAction ?? "",
    preventiveAction: ncr.preventiveAction ?? "",
    departmentId: ncr.department?.id ?? "",
    ngQty: ncr.ngQty,
    reworkQty: ncr.reworkQty,
    remakeQty: ncr.remakeQty,
    reworkOperationIds: ncr.reworkOperationIds,
  }
}
