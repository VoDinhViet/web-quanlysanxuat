import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import { IqcInspectionLevel } from "@/lib/types/iqc.type"
import type { AqlPlan } from "@/lib/types/iqc.type"

const getIqcAqlPlanSchema = z.object({
  quantity: z.number().positive(),
  inspectionLevel: z.enum(IqcInspectionLevel),
  aqlLevel: z.number(),
})

// Gợi ý bảng AQL live khi QC đang gõ (trước khi Lưu) — thuần tham khảo, không bắt buộc theo. Tra
// hụt (chưa có rule khớp lot size/level/AQL) hoặc lỗi khác đều degrade về `undefined` thay vì lỗi
// đỏ, cùng tiền lệ get-client-options.api.ts — panel gợi ý không phải lõi của form Lưu.
export const getIqcAqlPlan = createServerFn({ method: "GET" })
  .validator(getIqcAqlPlanSchema)
  .handler(async ({ data }): Promise<AqlPlan | undefined> => {
    try {
      const response = await http.get<AqlPlan>("/api/iqc/aql-plan", {
        params: data,
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getIqcAqlPlan")

      return undefined
    }
  })
