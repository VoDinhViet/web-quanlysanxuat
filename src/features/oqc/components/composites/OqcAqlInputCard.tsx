import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ClipboardCheck } from "@solar-icons/react"

import { oqcQueryOptions } from "@/features/oqc/api/options"
import { OqcAqlTallyStrip } from "@/features/oqc/components/composites/OqcAqlTallyStrip"
import { OqcDetailSectionCard } from "@/features/oqc/components/layouts/OqcDetailSectionCard"
import {
  confirmOqcFormDefaultValues,
  confirmOqcSchema,
} from "@/features/oqc/schemas/confirm-oqc.schema"
import { withForm } from "@/hooks/use-app-form"
import { aqlLevels, iqcInspectionLevelLabels } from "@/lib/types/iqc.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const inspectionLevelOptions = buildOptionsFromLabels(iqcInspectionLevelLabels)
const aqlLevelOptions = aqlLevels.map((level) => ({
  value: String(level),
  label: `${level.toFixed(2)}%`,
}))

// Inspection Level/AQL Level → cỡ mẫu/số lỗi → OqcAqlTallyStrip (bảng Ac/Re sống theo input,
// tra GET /oqc/aql-plan). `inspectionDate` không nằm trong ConfirmOqcReqDto (khác IQC) —
// hiển thị read-only ở OqcLotSummaryCard, không có ở đây.
export const OqcAqlInputCard = withForm({
  defaultValues: confirmOqcFormDefaultValues,
  validators: { onDynamic: confirmOqcSchema },
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const { oqcId } = useParams({ from: "/(authed)/manage_/oqc_/$oqcId" })
    const { data: oqc } = useSuspenseQuery(oqcQueryOptions(oqcId))

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.AppField name="sampleSize">
              {(field) => (
                <field.NumberField
                  label={`Số lượng bốc mẫu (${oqc.unit.name})`}
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
                  label={`Số lượng NG (${oqc.unit.name})`}
                  required
                  placeholder="VD: 0"
                  thousandSeparator={false}
                  disabled={disabled}
                />
              )}
            </form.AppField>
          </div>

          <OqcAqlTallyStrip
            form={form}
            quantity={oqc.quantity}
            disabled={disabled}
          />
        </div>
      </OqcDetailSectionCard>
    )
  },
})
