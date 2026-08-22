import { Checklist, CheckCircle, CloseCircle } from "@solar-icons/react"

import { RadioCardField } from "@/components/shared/inputs/RadioCardField"
import type { RadioCardOption } from "@/components/shared/inputs/RadioCardField"
import { IqcDetailSectionCard } from "@/features/iqc/components/detail/IqcDetailSectionCard"
import type { IqcDetailFormApi } from "@/features/iqc/hooks/use-iqc-detail-form"
import {
  iqcResultDescriptions,
  iqcResultLabels,
  IqcResult,
} from "@/lib/types/iqc.type"
import { cn } from "@/lib/utils"

const resultOptions: RadioCardOption<IqcResult>[] = [
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

// KẾT QUẢ KIỂM TRA — QC tự chọn PASS/FAIL (không suy từ bảng AQL, xem docs/domains/quality.md)
// + ghi chú kết quả. Chọn PASS ở đây quyết định luôn liệu QUYẾT ĐỊNH XỬ LÝ có hiện hay không
// (IqcDetailForm đọc `result` live để ẩn/hiện — xem file đó). Đây là điểm quyết định chính của
// cả trang nên có băng xác nhận sống (live) ngay dưới 2 thẻ, phản hồi ngay khi QC chọn.
export function IqcResultCard({ form, disabled }: IqcResultCardProps) {
  return (
    <IqcDetailSectionCard
      icon={Checklist}
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
              <p
                className={cn(
                  "rounded-lg px-3 py-2.5 text-xs font-medium",
                  isPass
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {isPass
                  ? "✓ Đạt yêu cầu — vật tư được phép nhập kho sau khi lưu."
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
