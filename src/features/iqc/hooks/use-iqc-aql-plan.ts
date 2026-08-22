import { useField } from "@tanstack/react-form"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { iqcAqlPlanQueryOptions } from "@/features/iqc/api/options"
import type { IqcDetailFormApi } from "@/features/iqc/hooks/use-iqc-detail-form"
import type { AqlPlan } from "@/lib/types/iqc.type"
import { IqcInspectionLevel } from "@/lib/types/iqc.type"

type IqcAqlPlan = {
  plan: AqlPlan | undefined
}

// Tra qua GET /iqc/aql-plan (đọc thẳng `qc_aql_plans`/`qc_aql_rules`) mỗi khi QC gõ
// `inspectionLevel`/`aqlLevel` — chỉ mang tính tham khảo, không auto-suy `result` như OQC (IQC
// luôn để QC tự chọn PASS/FAIL). `keepPreviousData` giữ nguyên plan cũ trong lúc query mới đang
// chạy, tránh nhấp nháy về placeholder mỗi lần gõ — cùng khuôn `useOqcAqlVerdict`.
export function useIqcAqlPlan(
  form: IqcDetailFormApi,
  quantity: number
): IqcAqlPlan {
  const inspectionLevel = useField({ form, name: "inspectionLevel" }).state
    .value
  const aqlLevel = useField({ form, name: "aqlLevel" }).state.value

  // `inspectionLevel` là `IqcInspectionLevel | ""` (chưa chọn) — fallback `I` chỉ để khớp kiểu,
  // query không bao giờ thực sự chạy với giá trị này vì `enabled` đã chặn khi rỗng.
  const { data: plan } = useQuery({
    ...iqcAqlPlanQueryOptions(
      quantity,
      inspectionLevel || IqcInspectionLevel.I,
      Number(aqlLevel)
    ),
    enabled: Boolean(inspectionLevel) && Boolean(aqlLevel),
    placeholderData: keepPreviousData,
  })

  return { plan }
}
