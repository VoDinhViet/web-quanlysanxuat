import { z } from "zod"

import { NcrType } from "@/lib/types/ncr.type"
import { emptyToUndefined } from "@/lib/zod-transforms"

// Wire contract for POST /api/ncrs — also the NcrCreateForm's onDynamic validator. An NCR-KH
// must carry a customer and a department up front; the SO is optional but needed to create a LSX.
export const createNcrSchema = z
  .object({
    type: z.enum(NcrType),
    itemId: z.string().trim().min(1, "Vui lòng chọn sản phẩm"),
    clientId: z.string().trim().transform(emptyToUndefined),
    orderId: z.string().trim().transform(emptyToUndefined),
    departmentId: z.string().trim().transform(emptyToUndefined),
    ngQty: z.number().min(0, "SL không được âm").optional(),
    defectDescription: z
      .string()
      .trim()
      .max(1000, "Tối đa 1000 ký tự")
      .transform(emptyToUndefined),
  })
  .superRefine((value, ctx) => {
    if (value.type !== NcrType.CUSTOMER) return

    if (!value.clientId) {
      ctx.addIssue({
        code: "custom",
        path: ["clientId"],
        message: "NCR khách hàng cần chọn khách hàng",
      })
    }

    if (!value.departmentId) {
      ctx.addIssue({
        code: "custom",
        path: ["departmentId"],
        message: "Vui lòng chọn bộ phận phát sinh",
      })
    }
  })

export type CreateNcrSchema = z.input<typeof createNcrSchema>

export const createNcrFormDefaultValues: CreateNcrSchema = {
  type: NcrType.INTERNAL,
  itemId: "",
  clientId: "",
  orderId: "",
  departmentId: "",
  ngQty: undefined,
  defectDescription: "",
}
