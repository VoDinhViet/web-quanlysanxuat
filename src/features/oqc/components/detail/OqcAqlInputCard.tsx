import { ClipboardCheck } from "lucide-react"

import { OqcAqlPlanPanel } from "@/features/oqc/components/detail/OqcAqlPlanPanel"
import { OqcDetailSectionCard } from "@/features/oqc/components/detail/OqcDetailSectionCard"
import type { OqcDetailFormApi } from "@/features/oqc/hooks/use-oqc-detail-form"
import { aqlLevels, iqcInspectionLevelLabels } from "@/lib/types/iqc.type"
import type { OqcDetail } from "@/lib/types/oqc.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const inspectionLevelOptions = buildOptionsFromLabels(iqcInspectionLevelLabels)
const aqlLevelOptions = aqlLevels.map((level) => ({
  value: String(level),
  label: `${level.toFixed(2)}%`,
}))

type OqcAqlInputCardProps = {
  form: OqcDetailFormApi
  oqc: OqcDetail
  disabled?: boolean
}

// Inspection Level/AQL Level + gợi ý bảng AQL (tham khảo) + cỡ mẫu/số lỗi. `inspectionDate`
// không nằm trong ConfirmOqcReqDto (khác IQC) — hiển thị read-only ở header, không có ở đây.
export function OqcAqlInputCard({ form, oqc, disabled }: OqcAqlInputCardProps) {
  return (
    <OqcDetailSectionCard
      icon={ClipboardCheck}
      title="Thông tin kiểm tra (AQL)"
      description="Cỡ mẫu, số lỗi và điều kiện lấy mẫu theo tiêu chuẩn AQL"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>

        <OqcAqlPlanPanel
          form={form}
          quantity={oqc.quantity}
          disabled={disabled}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.AppField name="sampleSize">
            {(field) => (
              <field.NumberField
                label={`Số lượng bốc mẫu (${oqc.item.unit.name})`}
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
                label={`Số lượng NG (${oqc.item.unit.name})`}
                required
                placeholder="VD: 0"
                thousandSeparator={false}
                disabled={disabled}
              />
            )}
          </form.AppField>
        </div>
      </div>
    </OqcDetailSectionCard>
  )
}
