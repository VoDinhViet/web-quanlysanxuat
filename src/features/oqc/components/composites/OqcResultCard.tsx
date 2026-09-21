import { CheckCircle, CloseCircle } from "@solar-icons/react"

import { RadioCardField } from "@/components/shared/composites/RadioCardField"
import type { RadioCardOption } from "@/components/shared/composites/RadioCardField"
import { OqcDetailSectionCard } from "@/features/oqc/components/layouts/OqcDetailSectionCard"
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

// KẾT QUẢ — QC tự chọn PASS/FAIL hoàn toàn + ghi chú kết quả. Nhánh disposition
// (ACCEPT/REWORK/SCRAP) hiện ở OqcDispositionCard riêng, do OqcDetailForm.tsx render khi `result`
// (live) = FAIL — cùng mirror IqcResultCard.tsx/IqcDispositionCard.tsx.
export const OqcResultCard = withForm({
  defaultValues: confirmOqcFormDefaultValues,
  validators: { onDynamic: confirmOqcSchema },
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    return (
      <OqcDetailSectionCard
        icon={CheckCircle}
        title="Kết quả kiểm tra"
        description="QC chọn kết quả dựa trên kiểm tra thực tế của lô hàng"
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
