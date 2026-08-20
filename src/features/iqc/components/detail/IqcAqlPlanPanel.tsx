import { useField } from "@tanstack/react-form"
import { Lightbulb } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import type { IqcDetailFormApi } from "@/features/iqc/hooks/use-iqc-detail-form"
import { resolveAqlPlan } from "@/lib/aql-sampling"

type IqcAqlPlanPanelProps = {
  form: IqcDetailFormApi
  quantity: number
  disabled?: boolean
}

// "QUY ĐỊNH AQL ĐANG ÁP DỤNG" — live gợi ý cỡ mẫu/Ac/Re từ bảng AQL khi user đã chọn đủ
// Inspection Level + AQL Level. Chỉ còn mang tính tham khảo — không còn chặn được Lưu (xem
// docs/domains/quality.md) — nên "—" khi bảng thiếu tổ hợp là trạng thái bình thường, không phải
// lỗi. Tông xanh dương (thông tin/gợi ý) để tách biệt rõ với các băng xác nhận quyết định
// (xanh lá/đỏ) ở IqcResultCard/IqcDispositionCard — panel này không phải là một quyết định.
export function IqcAqlPlanPanel({
  form,
  quantity,
  disabled,
}: IqcAqlPlanPanelProps) {
  const inspectionLevel = useField({ form, name: "inspectionLevel" }).state
    .value
  const aqlLevel = useField({ form, name: "aqlLevel" }).state.value

  const plan =
    inspectionLevel && aqlLevel
      ? resolveAqlPlan(quantity, inspectionLevel, Number(aqlLevel))
      : undefined

  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50/60 px-3.5 py-3 dark:border-blue-500/20 dark:bg-blue-500/5">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />

      {plan ? (
        <p className="text-xs text-blue-900 dark:text-blue-300">
          <span className="font-semibold">Gợi ý bảng AQL</span> (code{" "}
          {plan.codeLetter}): cỡ mẫu n = <strong>{plan.sampleSize}</strong>, Ac
          = {plan.ac}, Re = {plan.re}.{" "}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 align-baseline text-xs text-blue-700 dark:text-blue-300"
            disabled={disabled}
            onClick={() => form.setFieldValue("sampleSize", plan.sampleSize)}
          >
            Dùng gợi ý
          </Button>
        </p>
      ) : (
        <p className="text-xs text-blue-900/70 dark:text-blue-300/70">
          Chọn Inspection Level và AQL Level để xem gợi ý cỡ mẫu — chỉ mang tính
          tham khảo, không bắt buộc theo.
        </p>
      )}
    </div>
  )
}
