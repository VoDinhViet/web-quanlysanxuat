import {
  ChecklistMinimalistic,
  DangerTriangle,
  Sledgehammer,
  TrashBinTrash,
} from "@solar-icons/react"

import { RadioCardField } from "@/components/shared/composites/RadioCardField"
import type { RadioCardOption } from "@/components/shared/composites/RadioCardField"
import { OqcDetailSectionCard } from "@/features/oqc/components/layouts/OqcDetailSectionCard"
import {
  confirmOqcFormDefaultValues,
  confirmOqcSchema,
} from "@/features/oqc/schemas/confirm-oqc.schema"
import { withForm } from "@/hooks/use-app-form"
import {
  oqcDispositionDescriptions,
  oqcDispositionLabels,
  OqcDisposition,
} from "@/lib/types/oqc.type"

const dispositionOptions: RadioCardOption<OqcDisposition>[] = [
  {
    value: OqcDisposition.ACCEPT,
    label: oqcDispositionLabels[OqcDisposition.ACCEPT],
    description: oqcDispositionDescriptions[OqcDisposition.ACCEPT],
    icon: DangerTriangle,
    activeClassName: "border-amber-500",
    chipClassName:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    badgeClassName: "bg-amber-500 text-white",
  },
  {
    value: OqcDisposition.REWORK,
    label: oqcDispositionLabels[OqcDisposition.REWORK],
    description: oqcDispositionDescriptions[OqcDisposition.REWORK],
    icon: Sledgehammer,
    activeClassName: "border-blue-500",
    chipClassName:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    badgeClassName: "bg-blue-500 text-white",
  },
  {
    value: OqcDisposition.SCRAP,
    label: oqcDispositionLabels[OqcDisposition.SCRAP],
    description: oqcDispositionDescriptions[OqcDisposition.SCRAP],
    icon: TrashBinTrash,
    activeClassName: "border-destructive",
    chipClassName: "bg-destructive/15 text-destructive",
    badgeClassName: "bg-destructive text-destructive-foreground",
  },
]

// QUYẾT ĐỊNH XỬ LÝ — chỉ được render khi `result` (live) = FAIL, OqcDetailForm.tsx quyết định
// việc đó. Không chọn phương án nào vẫn lưu được (→ PENDING). Mirror IqcDispositionCard.tsx,
// thu gọn: chỉ 3 lựa chọn (ACCEPT/REWORK/SCRAP, không có SORT nên không cần
// IqcSortSplitFields tương đương) + ghi chú quyết định.
export const OqcDispositionCard = withForm({
  defaultValues: confirmOqcFormDefaultValues,
  validators: { onSubmit: confirmOqcSchema },
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    return (
      <OqcDetailSectionCard
        icon={ChecklistMinimalistic}
        title="Quyết định xử lý"
        description="Chọn hướng xử lý cho lô hàng không đạt (FAIL)"
      >
        <div className="space-y-4">
          <form.Field name="disposition">
            {(field) => (
              <RadioCardField
                field={field}
                options={dispositionOptions}
                disabled={disabled}
                columns={3}
              />
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.values.disposition}>
            {(disposition) => {
              if (disposition === OqcDisposition.ACCEPT) {
                return (
                  <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                    ⚠ Hoàn thành ngay — không cần kiểm lại.
                  </p>
                )
              }

              if (disposition === OqcDisposition.REWORK) {
                return (
                  <p className="rounded-lg bg-blue-50 px-3 py-2.5 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                    → Chuyển "Đang rework" — trả xưởng sửa lại, QC lấy mẫu và
                    xác nhận lại trên cùng phiếu này tới khi PASS.
                  </p>
                )
              }

              if (disposition === OqcDisposition.SCRAP) {
                return (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-xs font-medium text-destructive">
                    ✗ Hoàn thành ngay — loại bỏ hẳn lô hàng, giải phóng lại
                    quota lô của công đoạn.
                  </p>
                )
              }

              return null
            }}
          </form.Subscribe>

          <form.AppField name="dispositionNote">
            {(field) => (
              <field.TextareaField
                label="Ghi chú quyết định"
                placeholder="Ghi chú thêm về hướng xử lý (nếu có)"
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
