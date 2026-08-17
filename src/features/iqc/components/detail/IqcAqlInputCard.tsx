import { ClipboardCheck } from "@solar-icons/react"

import { IqcAqlPlanPanel } from "@/features/iqc/components/detail/IqcAqlPlanPanel"
import { IqcDetailSectionCard } from "@/features/iqc/components/detail/IqcDetailSectionCard"
import type { IqcDetailFormApi } from "@/features/iqc/hooks/use-iqc-detail-form"
import { aqlLevels, iqcInspectionLevelLabels } from "@/lib/types/iqc.type"
import type { IqcDetail } from "@/lib/types/iqc.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const inspectionLevelOptions = buildOptionsFromLabels(iqcInspectionLevelLabels)
const aqlLevelOptions = aqlLevels.map((level) => ({
  value: String(level),
  label: `${level.toFixed(2)}%`,
}))

type IqcAqlInputCardProps = {
  form: IqcDetailFormApi
  iqc: IqcDetail
  disabled?: boolean
}

// THÔNG TIN KIỂM TRA (AQL) — luôn là form sửa được (không còn tách nhánh read-only/form như
// trước): Inspection Level/AQL Level/Ngày kiểm tra, gợi ý bảng AQL (chỉ tham khảo), cỡ mẫu/số
// lỗi, và 3 field ngữ cảnh còn lại (tiêu chuẩn/người kiểm/dụng cụ đo) — ảnh mẫu bỏ sót nhóm này
// nhưng đã có sẵn dữ liệu, giữ lại thay vì thụt lùi.
export function IqcAqlInputCard({ form, iqc, disabled }: IqcAqlInputCardProps) {
  return (
    <IqcDetailSectionCard
      icon={ClipboardCheck}
      title="Thông tin kiểm tra (AQL)"
      description="Cỡ mẫu, số lỗi và điều kiện lấy mẫu theo tiêu chuẩn AQL"
    >
      <div className="space-y-5">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <form.AppField name="inspectionLevel">
              {(field) => (
                <field.SelectField
                  label="Inspection Level"
                  required
                  placeholder="Chọn mức kiểm tra"
                  options={inspectionLevelOptions}
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="aqlLevel">
              {(field) => (
                <field.SelectField
                  label="Mức AQL"
                  required
                  placeholder="Chọn mức AQL"
                  options={aqlLevelOptions}
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="inspectionDate">
              {(field) => (
                <field.TextField
                  label="Ngày kiểm tra"
                  type="datetime-local"
                  disabled={disabled}
                />
              )}
            </form.AppField>
          </div>

          <IqcAqlPlanPanel
            form={form}
            quantity={iqc.quantity}
            disabled={disabled}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.AppField name="sampleSize">
              {(field) => (
                <field.NumberField
                  label={`Số lượng bốc mẫu (${iqc.item.unit.name})`}
                  required
                  placeholder="VD: 32"
                  thousandSeparator={false}
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="defectQty">
              {(field) => (
                <field.NumberField
                  label={`Số lượng NG (${iqc.item.unit.name})`}
                  required
                  placeholder="VD: 0"
                  thousandSeparator={false}
                  disabled={disabled}
                />
              )}
            </form.AppField>
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Thông tin bổ sung
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <form.AppField name="inspectionStandard">
              {(field) => (
                <field.TextField
                  label="Tiêu chuẩn kiểm"
                  placeholder="VD: VT-0152 Rev.02"
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="inspectorName">
              {(field) => (
                <field.TextField
                  label="Người kiểm tra"
                  placeholder="Tên người kiểm"
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="measuringTools">
              {(field) => (
                <field.TextField
                  label="Dụng cụ đo"
                  placeholder="VD: Thước cặp, thước lá"
                  disabled={disabled}
                />
              )}
            </form.AppField>
          </div>
        </div>
      </div>
    </IqcDetailSectionCard>
  )
}
