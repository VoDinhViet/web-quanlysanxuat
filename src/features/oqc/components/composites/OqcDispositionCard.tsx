import {
  ChecklistMinimalistic,
  DangerTriangle,
  Filter,
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

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// numeric(18,3) on the backend — same rounding as confirm-oqc.schema.ts's `scale`.
function roundToScale(value: number): number {
  return Math.round(value * 1000) / 1000
}

const sortOption: RadioCardOption<OqcDisposition> = {
  value: OqcDisposition.SORT,
  label: oqcDispositionLabels[OqcDisposition.SORT],
  description: oqcDispositionDescriptions[OqcDisposition.SORT],
  icon: Filter,
  activeClassName: "border-violet-500",
  chipClassName:
    "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
  badgeClassName: "bg-violet-500 text-white",
}

const acceptOption: RadioCardOption<OqcDisposition> = {
  value: OqcDisposition.ACCEPT,
  label: oqcDispositionLabels[OqcDisposition.ACCEPT],
  description: oqcDispositionDescriptions[OqcDisposition.ACCEPT],
  icon: DangerTriangle,
  activeClassName: "border-amber-500",
  chipClassName:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  badgeClassName: "bg-amber-500 text-white",
}

// REWORK/SCRAP only exist for lots confirmed before the SORT flow — new lots pick ACCEPT or SORT.
const legacyOptions: RadioCardOption<OqcDisposition>[] = [
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
// việc đó. Không chọn phương án nào vẫn lưu được (→ PENDING). Lô mới chọn ACCEPT hoặc SORT
// (sàng lọc: QC nhập SL NG, SL OK tự tính); REWORK/SCRAP chỉ hiện lại cho lô cũ đã chọn chúng.
export const OqcDispositionCard = withForm({
  defaultValues: confirmOqcFormDefaultValues,
  validators: { onDynamic: confirmOqcSchema },
  props: {
    disabled: false,
    quantity: 0,
    unitName: "",
    showLegacyDispositions: false,
  },
  render: function Render({
    form,
    disabled,
    quantity,
    unitName,
    showLegacyDispositions,
  }) {
    const options = [
      acceptOption,
      sortOption,
      ...(showLegacyDispositions ? legacyOptions : []),
    ]

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
                options={options}
                disabled={disabled}
                columns={options.length > 2 ? 3 : 2}
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

              if (disposition === OqcDisposition.SORT) {
                return (
                  <div className="space-y-3 rounded-lg border border-violet-200 bg-violet-50/50 p-3.5 dark:border-violet-500/20 dark:bg-violet-500/5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <form.AppField
                        name="sortNgQty"
                        listeners={{
                          onChange: ({ value }) =>
                            form.setFieldValue(
                              "sortOkQty",
                              value === undefined
                                ? undefined
                                : roundToScale(quantity - value)
                            ),
                        }}
                      >
                        {(field) => (
                          <field.NumberField
                            label={`SL NG (${unitName}) — sinh NCR`}
                            required
                            placeholder="0"
                            thousandSeparator={false}
                            disabled={disabled}
                          />
                        )}
                      </form.AppField>

                      <form.Subscribe
                        selector={(state) => state.values.sortOkQty}
                      >
                        {(sortOkQty) => (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-foreground">
                              SL OK ({unitName})
                            </p>
                            <div className="flex h-9 items-center rounded-md border border-dashed border-border bg-muted/40 px-3 text-xs font-medium text-muted-foreground">
                              {sortOkQty === undefined
                                ? "—"
                                : quantityFormatter.format(sortOkQty)}
                              <span className="ml-1.5 text-[10px] font-normal">
                                (tự tính)
                              </span>
                            </div>
                          </div>
                        )}
                      </form.Subscribe>
                    </div>
                    <p className="rounded-md bg-background/60 px-2.5 py-2 text-xs font-medium text-muted-foreground">
                      SL lô = {quantityFormatter.format(quantity)} {unitName} —
                      phần OK nhập kho thành phẩm, phần NG tự sinh NCR nội bộ.
                    </p>
                  </div>
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
