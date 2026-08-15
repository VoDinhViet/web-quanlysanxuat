import {
  ChecklistMinimalistic,
  DangerTriangle,
  Delivery,
  Layers,
} from "@solar-icons/react"

import { IqcDetailSectionCard } from "@/features/iqc/components/detail/IqcDetailSectionCard"
import { IqcRadioCardField } from "@/features/iqc/components/detail/IqcRadioCardField"
import type { IqcRadioCardOption } from "@/features/iqc/components/detail/IqcRadioCardField"
import { IqcSortSplitFields } from "@/features/iqc/components/detail/IqcSortSplitFields"
import type { IqcDetailFormApi } from "@/features/iqc/hooks/use-iqc-detail-form"
import {
  iqcDispositionDescriptions,
  iqcDispositionLabels,
  IqcDisposition,
} from "@/lib/types/iqc.type"
import type { IqcDetail } from "@/lib/types/iqc.type"

const dispositionOptions: IqcRadioCardOption<IqcDisposition>[] = [
  {
    value: IqcDisposition.CONCESSION,
    label: iqcDispositionLabels[IqcDisposition.CONCESSION],
    description: iqcDispositionDescriptions[IqcDisposition.CONCESSION],
    icon: DangerTriangle,
    activeClassName: "border-amber-500 bg-amber-50 dark:bg-amber-500/10",
    chipClassName:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  },
  {
    value: IqcDisposition.SORT,
    label: iqcDispositionLabels[IqcDisposition.SORT],
    description: iqcDispositionDescriptions[IqcDisposition.SORT],
    icon: Layers,
    activeClassName: "border-violet-500 bg-violet-50 dark:bg-violet-500/10",
    chipClassName:
      "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
  },
  {
    value: IqcDisposition.RETURN,
    label: iqcDispositionLabels[IqcDisposition.RETURN],
    description: iqcDispositionDescriptions[IqcDisposition.RETURN],
    icon: Delivery,
    activeClassName: "border-foreground/40 bg-muted",
    chipClassName: "bg-foreground/10 text-foreground",
  },
]

type IqcDispositionCardProps = {
  form: IqcDetailFormApi
  iqc: IqcDetail
  disabled?: boolean
}

// QUYẾT ĐỊNH XỬ LÝ — chỉ được render khi `result` (live) = FAIL, IqcDetailForm quyết định việc
// đó (1 useField duy nhất dùng chung với cả bằng chứng quyết định, tránh 2 subscription trùng
// nhau). Không chọn phương án nào vẫn lưu được (→ Chờ xử lý) — SL OK/NG chỉ hiện khi SORT. Đây
// là điểm quyết định thứ hai của trang (sau KẾT QUẢ) nên dùng cùng khuôn thẻ radio lớn.
export function IqcDispositionCard({
  form,
  iqc,
  disabled,
}: IqcDispositionCardProps) {
  return (
    <IqcDetailSectionCard
      icon={ChecklistMinimalistic}
      title="Quyết định xử lý"
      description="Chọn hướng xử lý cho lô hàng không đạt (FAIL)"
    >
      <div className="space-y-4">
        <form.Field name="disposition">
          {(field) => (
            <IqcRadioCardField
              field={field}
              options={dispositionOptions}
              disabled={disabled}
              columns={3}
            />
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.disposition}>
          {(disposition) => {
            if (disposition === IqcDisposition.SORT) {
              return (
                <IqcSortSplitFields
                  form={form}
                  quantity={iqc.quantity}
                  unitName={iqc.item.unit.name}
                  disabled={disabled}
                />
              )
            }

            if (disposition === IqcDisposition.CONCESSION) {
              return (
                <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  ⚠ Hoàn thành ngay — không cần xuất trả hàng.
                </p>
              )
            }

            if (disposition === IqcDisposition.RETURN) {
              return (
                <p className="rounded-lg bg-muted px-3 py-2.5 text-xs font-medium text-foreground">
                  → Chuyển "Chờ trả NCC" — hệ thống tự sinh phiếu trả NCC cho
                  toàn bộ lô sau khi lưu.
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
    </IqcDetailSectionCard>
  )
}
