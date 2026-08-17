import { CheckCircle, CircleX } from "lucide-react"

import { RadioCardField } from "@/components/shared/inputs/RadioCardField"
import type { RadioCardOption } from "@/components/shared/inputs/RadioCardField"
import { OqcDetailSectionCard } from "@/features/oqc/components/detail/OqcDetailSectionCard"
import type { OqcDetailFormApi } from "@/features/oqc/hooks/use-oqc-detail-form"
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
    activeClassName: "border-success bg-success/5",
    chipClassName: "bg-success/15 text-success",
  },
  {
    value: IqcResult.FAIL,
    label: iqcResultLabels[IqcResult.FAIL],
    description: iqcResultDescriptions[IqcResult.FAIL],
    icon: CircleX,
    activeClassName: "border-destructive bg-destructive/5",
    chipClassName: "bg-destructive/15 text-destructive",
  },
]

type OqcResultCardProps = {
  form: OqcDetailFormApi
  disabled?: boolean
}

// KẾT QUẢ — QC tự chọn PASS/FAIL (không suy từ bảng AQL) + ghi chú kết quả. Không có nhánh
// disposition — mirrors IqcResultCard.tsx nhưng OQC không có khái niệm xử lý sau FAIL: FAIL chỉ
// đơn giản chuyển "Chờ xử lý", QC lấy mẫu lại và xác nhận lại trên cùng phiếu.
export function OqcResultCard({ form, disabled }: OqcResultCardProps) {
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
}
