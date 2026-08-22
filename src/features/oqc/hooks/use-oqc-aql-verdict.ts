import { useField } from "@tanstack/react-form"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { oqcAqlPlanQueryOptions } from "@/features/oqc/api/options"
import type { OqcDetailFormApi } from "@/features/oqc/components/detail/OqcDetailForm"
import type { AqlPlan } from "@/lib/types/iqc.type"
import { IqcInspectionLevel, IqcResult } from "@/lib/types/iqc.type"

type OqcAqlVerdict = {
  plan: AqlPlan | undefined
  verdict: IqcResult | undefined
}

function resolveVerdict(
  plan: AqlPlan | undefined,
  defectQty: number | undefined
): IqcResult | undefined {
  if (!plan || defectQty === undefined) return undefined
  return defectQty <= plan.ac ? IqcResult.PASS : IqcResult.FAIL
}

// Cùng một plan cho cả OqcAqlTallyStrip (vẽ dải ô) và OqcResultCard (cảnh báo khi QC chọn kết quả
// khác gợi ý) — gộp vào 1 hook để 2 nơi luôn đọc cùng verdict, không gọi API rời rạc dễ lệch nhau.
// Tra qua GET /oqc/aql-plan (đọc thẳng `qc_aql_plans`/`qc_aql_rules`) — chỉ mang tính tham khảo,
// không chặn Lưu. `keepPreviousData` giữ nguyên plan cũ trong lúc query mới đang chạy, tránh
// nhấp nháy về placeholder "Chọn Inspection Level..." mỗi lần gõ.
export function useOqcAqlVerdict(
  form: OqcDetailFormApi,
  quantity: number
): OqcAqlVerdict {
  const inspectionLevel = useField({ form, name: "inspectionLevel" }).state
    .value
  const aqlLevel = useField({ form, name: "aqlLevel" }).state.value
  const defectQty = useField({ form, name: "defectQty" }).state.value

  // `inspectionLevel` là `IqcInspectionLevel | ""` (chưa chọn) — fallback `I` chỉ để khớp kiểu,
  // query không bao giờ thực sự chạy với giá trị này vì `enabled` đã chặn khi rỗng.
  const { data: plan } = useQuery({
    ...oqcAqlPlanQueryOptions(
      quantity,
      inspectionLevel || IqcInspectionLevel.I,
      Number(aqlLevel)
    ),
    enabled: Boolean(inspectionLevel) && Boolean(aqlLevel),
    placeholderData: keepPreviousData,
  })

  return { plan, verdict: resolveVerdict(plan, defectQty) }
}
