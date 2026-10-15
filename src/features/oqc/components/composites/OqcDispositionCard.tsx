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
import { cn } from "@/lib/utils"

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
  activeClassName: "border-primary",
  chipClassName: "bg-info-soft text-info-ink",
  badgeClassName: "bg-primary text-primary-foreground",
}

const acceptOption: RadioCardOption<OqcDisposition> = {
  value: OqcDisposition.ACCEPT,
  label: oqcDispositionLabels[OqcDisposition.ACCEPT],
  description: oqcDispositionDescriptions[OqcDisposition.ACCEPT],
  icon: DangerTriangle,
  activeClassName: "border-primary",
  chipClassName: "bg-warning-soft text-warning-ink",
  badgeClassName: "bg-primary text-primary-foreground",
}

// REWORK/SCRAP only exist for lots confirmed before the SORT flow — new lots pick ACCEPT or SORT.
const legacyOptions: RadioCardOption<OqcDisposition>[] = [
  {
    value: OqcDisposition.REWORK,
    label: oqcDispositionLabels[OqcDisposition.REWORK],
    description: oqcDispositionDescriptions[OqcDisposition.REWORK],
    icon: Sledgehammer,
    activeClassName: "border-primary",
    chipClassName: "bg-info-soft text-info-ink",
    badgeClassName: "bg-primary text-primary-foreground",
  },
  {
    value: OqcDisposition.SCRAP,
    label: oqcDispositionLabels[OqcDisposition.SCRAP],
    description: oqcDispositionDescriptions[OqcDisposition.SCRAP],
    icon: TrashBinTrash,
    activeClassName: "border-destructive",
    chipClassName: "bg-destructive-soft text-destructive-ink",
    badgeClassName: "bg-destructive text-destructive-foreground",
  },
]

type SortSplitProps = {
  quantity: number
  unitName: string
  sortNgQty: number | undefined
}

// NG hợp lệ khi nằm trong [0, SL lô]; ngoài khoảng đó (hoặc chưa nhập) thì không có phần OK để hiển thị.
function resolveSortSplit({ quantity, sortNgQty }: SortSplitProps) {
  if (sortNgQty === undefined || sortNgQty < 0 || sortNgQty > quantity) {
    return null
  }
  const okQty = roundToScale(quantity - sortNgQty)
  const okPercent = quantity > 0 ? (okQty / quantity) * 100 : 0
  return { okQty, ngQty: sortNgQty, okPercent }
}

function SortOkTile(props: SortSplitProps) {
  const split = resolveSortSplit(props)

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">
        SL OK ({props.unitName}) — nhập kho
      </p>
      <div className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm">
        {split ? (
          <>
            <span className="font-semibold tabular-nums">
              {quantityFormatter.format(split.okQty)}
            </span>
            <span className="text-xs text-muted-foreground">(tự tính)</span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">
            Nhập SL NG hợp lệ
          </span>
        )}
      </div>
    </div>
  )
}

// Thanh chia lô OK / NG và một dòng diễn giải điều sẽ xảy ra khi lưu.
function SortSplitPreview(props: SortSplitProps) {
  const split = resolveSortSplit(props)
  const { quantity, unitName } = props

  if (!split) {
    return (
      <p
        className={cn(
          "text-xs",
          props.sortNgQty === undefined
            ? "text-muted-foreground"
            : "text-destructive"
        )}
      >
        SL NG phải từ 0 đến{" "}
        <span className="tabular-nums">
          {quantityFormatter.format(quantity)}
        </span>{" "}
        {unitName} (SL lô).
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-background">
        <div
          className="bg-primary transition-[width] duration-200"
          style={{ width: `${split.okPercent}%` }}
        />
        <div
          className="bg-muted-foreground/25 transition-[width] duration-200"
          style={{ width: `${100 - split.okPercent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground tabular-nums">
          {quantityFormatter.format(split.okQty)}
        </span>{" "}
        {unitName} OK nhập kho thành phẩm ·{" "}
        <span className="font-semibold text-foreground tabular-nums">
          {quantityFormatter.format(split.ngQty)}
        </span>{" "}
        {unitName} NG {split.ngQty > 0 ? "sinh NCR nội bộ" : "không sinh NCR"}
      </p>
    </div>
  )
}

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
                  <p className="rounded-lg bg-warning-soft px-3 py-2.5 text-xs font-medium text-warning-ink">
                    Hoàn thành ngay — không cần kiểm lại.
                  </p>
                )
              }

              if (disposition === OqcDisposition.SORT) {
                return (
                  <div className="space-y-4 rounded-lg bg-muted/40 p-4">
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
                        selector={(state) => state.values.sortNgQty}
                      >
                        {(sortNgQty) => (
                          <SortOkTile
                            quantity={quantity}
                            unitName={unitName}
                            sortNgQty={sortNgQty}
                          />
                        )}
                      </form.Subscribe>
                    </div>
                    <form.Subscribe
                      selector={(state) => state.values.sortNgQty}
                    >
                      {(sortNgQty) => (
                        <SortSplitPreview
                          quantity={quantity}
                          unitName={unitName}
                          sortNgQty={sortNgQty}
                        />
                      )}
                    </form.Subscribe>
                  </div>
                )
              }

              if (disposition === OqcDisposition.REWORK) {
                return (
                  <p className="rounded-lg bg-info-soft px-3 py-2.5 text-xs font-medium text-info-ink">
                    Chuyển "Đang rework" — trả xưởng sửa lại, QC lấy mẫu và xác
                    nhận lại trên cùng phiếu này tới khi PASS.
                  </p>
                )
              }

              if (disposition === OqcDisposition.SCRAP) {
                return (
                  <p className="rounded-lg bg-destructive-soft px-3 py-2.5 text-xs font-medium text-destructive-ink">
                    Hoàn thành ngay — loại bỏ hẳn lô hàng, giải phóng lại quota
                    lô của công đoạn.
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
