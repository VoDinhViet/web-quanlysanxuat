import { Radio } from "@base-ui/react/radio"
import { Checklist, CheckCircle, CloseCircle } from "@solar-icons/react"
import { Check } from "lucide-react"

import { RadioGroup } from "@/components/ui/radio-group"
import { IqcDetailSectionCard } from "@/features/iqc/components/layouts/IqcDetailSectionCard"
import type { IqcDetailFormApi } from "@/features/iqc/hooks/use-iqc-detail-form"
import {
  iqcResultDescriptions,
  iqcResultLabels,
  IqcResult,
} from "@/lib/types/iqc.type"
import { cn } from "@/lib/utils"
import type { IconProps } from "@solar-icons/react"
import type { AnyFieldApi } from "@tanstack/react-form"
import type { ComponentType } from "react"

type IqcResultRadioOption = {
  value: IqcResult
  label: string
  description: string
  icon: ComponentType<IconProps>
  activeClassName: string
  chipClassName: string
  badgeClassName: string
}

const iqcResultRadioOptions: IqcResultRadioOption[] = [
  {
    value: IqcResult.PASS,
    label: iqcResultLabels[IqcResult.PASS],
    description: iqcResultDescriptions[IqcResult.PASS],
    icon: CheckCircle,
    activeClassName: "border-success",
    chipClassName: "bg-success/15 text-success",
    badgeClassName: "bg-success text-success-foreground",
  },
  {
    value: IqcResult.FAIL,
    label: iqcResultLabels[IqcResult.FAIL],
    description: iqcResultDescriptions[IqcResult.FAIL],
    icon: CloseCircle,
    activeClassName: "border-destructive",
    chipClassName: "bg-destructive/15 text-destructive",
    badgeClassName: "bg-destructive text-destructive-foreground",
  },
]

type IqcResultCardProps = {
  form: IqcDetailFormApi
  disabled?: boolean
}

// Radio cards viết riêng cho thẻ này (không qua RadioCardField dùng chung với
// OqcResultCard/IqcDispositionCard/OqcDispositionCard) — cùng thị giác (icon chip + label +
// description + badge check góc trên-phải, Base UI Radio.Root thô), nhưng độc lập để đổi sau
// không ảnh hưởng 3 nơi còn lại.
function IqcResultRadioCards({
  field,
  disabled,
}: {
  field: AnyFieldApi
  disabled?: boolean
}) {
  return (
    <RadioGroup
      value={field.state.value}
      onValueChange={(value) => field.handleChange(value)}
      disabled={disabled}
      className="grid gap-3 sm:grid-cols-2"
    >
      {iqcResultRadioOptions.map((option) => {
        const Icon = option.icon
        const isChecked = field.state.value === option.value

        return (
          <Radio.Root
            key={option.value}
            value={option.value}
            className={cn(
              "relative cursor-pointer rounded-xl border-2 border-border bg-card p-4 text-start transition-colors hover:border-foreground/25 data-disabled:cursor-not-allowed data-disabled:opacity-50",
              isChecked && option.activeClassName
            )}
          >
            <div className="flex items-start gap-3 pr-5">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors",
                  isChecked && option.chipClassName
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="space-y-0.5 pt-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {option.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </div>

            {isChecked ? (
              <span
                className={cn(
                  "absolute top-3 right-3 flex size-5 items-center justify-center rounded-full",
                  option.badgeClassName
                )}
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
            ) : null}
          </Radio.Root>
        )
      })}
    </RadioGroup>
  )
}

// KẾT QUẢ KIỂM TRA — QC tự chọn PASS/FAIL hoàn toàn + ghi chú kết quả. Chọn PASS ở đây quyết định
// luôn liệu QUYẾT ĐỊNH XỬ LÝ có hiện hay không (IqcDetailForm đọc `result` live để ẩn/hiện — xem
// file đó). Đây là điểm quyết định chính của cả trang nên có băng xác nhận sống (live) ngay dưới
// 2 thẻ, phản hồi ngay khi QC chọn.
export function IqcResultCard({ form, disabled }: IqcResultCardProps) {
  return (
    <IqcDetailSectionCard
      icon={Checklist}
      title="Kết quả kiểm tra"
      description="QC chọn kết quả dựa trên kiểm tra thực tế của lô hàng"
    >
      <div className="space-y-4">
        <form.Field name="result">
          {(field) => <IqcResultRadioCards field={field} disabled={disabled} />}
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
                  ? "✓ Đạt yêu cầu chất lượng kiểm tra."
                  : "✗ Không đạt — chọn phương án xử lý ở khối bên dưới."}
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
    </IqcDetailSectionCard>
  )
}
