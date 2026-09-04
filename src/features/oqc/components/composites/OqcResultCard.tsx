import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { CheckCircle, CloseCircle } from "@solar-icons/react"

import { RadioCardField } from "@/components/shared/composites/RadioCardField"
import type { RadioCardOption } from "@/components/shared/composites/RadioCardField"
import { oqcQueryOptions } from "@/features/oqc/api/options"
import { OqcDetailSectionCard } from "@/features/oqc/components/layouts/OqcDetailSectionCard"
import { useOqcAqlVerdict } from "@/features/oqc/hooks/use-oqc-aql-verdict"
import {
  confirmOqcFormDefaultValues,
  confirmOqcSchema,
} from "@/features/oqc/schemas/confirm-oqc.schema"
import { withForm } from "@/hooks/use-app-form"
import { iqcResultLabels, IqcResult } from "@/lib/types/iqc.type"
import { oqcResultDescriptions } from "@/lib/types/oqc.type"
import { cn } from "@/lib/utils"

const resultOptions: RadioCardOption<IqcResult>[] = [
  {
    value: IqcResult.PASS,
    label: iqcResultLabels[IqcResult.PASS],
    description: oqcResultDescriptions[IqcResult.PASS],
    icon: CheckCircle,
    activeClassName: "border-success",
    chipClassName: "bg-success/15 text-success",
    badgeClassName: "bg-success text-success-foreground",
  },
  {
    value: IqcResult.FAIL,
    label: iqcResultLabels[IqcResult.FAIL],
    description: oqcResultDescriptions[IqcResult.FAIL],
    icon: CloseCircle,
    activeClassName: "border-destructive",
    chipClassName: "bg-destructive/15 text-destructive",
    badgeClassName: "bg-destructive text-destructive-foreground",
  },
]

// KẾT QUẢ — QC tự chọn PASS/FAIL (không suy từ bảng AQL) + ghi chú kết quả. `verdict` (từ
// useOqcAqlVerdict, cùng hook OqcAqlTallyStrip dùng) chỉ để cảnh báo sớm khi kết quả chọn khác
// gợi ý — backend chặn lưu bằng lỗi `result_override_reason_required` nếu vậy, cảnh báo này giúp
// user hiểu lỗi đó trước khi bấm Lưu chứ không tự chặn gì ở đây. Nhánh disposition
// (ACCEPT/REWORK/SCRAP) hiện ở OqcDispositionCard riêng, do OqcDetailForm.tsx render khi `result`
// (live) = FAIL — cùng mirror IqcResultCard.tsx/IqcDispositionCard.tsx.
export const OqcResultCard = withForm({
  defaultValues: confirmOqcFormDefaultValues,
  validators: { onDynamic: confirmOqcSchema },
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const { oqcId } = useParams({ from: "/(authed)/manage_/oqc_/$oqcId" })
    const { data: oqc } = useSuspenseQuery(oqcQueryOptions(oqcId))
    const { verdict } = useOqcAqlVerdict(form, oqc.quantity)

    return (
      <OqcDetailSectionCard
        icon={CheckCircle}
        title="Kết quả kiểm tra"
        description="QC chọn kết quả dựa trên số liệu kiểm tra thực tế ở khối bên trên"
      >
        <div className="space-y-4">
          <form.Field name="result">
            {(field) => (
              <RadioCardField
                field={field}
                options={resultOptions}
                disabled={disabled}
              />
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.result}>
            {(result) => {
              if (!result) {
                return (
                  <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                    Chọn PASS hoặc FAIL để ghi nhận kết quả kiểm tra.
                  </p>
                )
              }

              const isPass = result === IqcResult.PASS

              return (
                <div className="space-y-2">
                  <p
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-xs font-medium",
                      isPass
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {isPass
                      ? "✓ Đạt yêu cầu — lô hàng được phép nhập kho thành phẩm sau khi lưu."
                      : "✗ Không đạt — lấy mẫu lại và xác nhận lại trên cùng phiếu này."}
                  </p>

                  {verdict !== undefined && verdict !== result && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                      ⚠ Kết quả bạn chọn khác gợi ý bảng AQL (
                      {iqcResultLabels[verdict]}) — hãy ghi rõ lý do ở Ghi chú
                      kết quả.
                    </p>
                  )}
                </div>
              )
            }}
          </form.Subscribe>

          <form.AppField name="resultNote">
            {(field) => (
              <field.TextareaField
                label="Ghi chú kết quả"
                placeholder="Ghi chú thêm về kết quả kiểm tra (nếu có)"
                maxLength={500}
                disabled={disabled}
              />
            )}
          </form.AppField>
        </div>
      </OqcDetailSectionCard>
    )
  },
})
