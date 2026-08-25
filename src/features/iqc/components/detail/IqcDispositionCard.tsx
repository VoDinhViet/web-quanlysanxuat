import {
  ChecklistMinimalistic,
  DangerTriangle,
  Delivery,
  Layers,
} from "@solar-icons/react"

import { RadioCardField } from "@/components/shared/inputs/RadioCardField"
import type { RadioCardOption } from "@/components/shared/inputs/RadioCardField"
import { IqcDetailSectionCard } from "@/features/iqc/components/detail/IqcDetailSectionCard"
import { IqcSortSplitFields } from "@/features/iqc/components/detail/IqcSortSplitFields"
import type { IqcDetailFormApi } from "@/features/iqc/hooks/use-iqc-detail-form"
import {
  iqcDispositionDescriptions,
  iqcDispositionLabels,
  IqcDisposition,
} from "@/lib/types/iqc.type"
import type { IqcDetail } from "@/lib/types/iqc.type"

const dispositionOptions: RadioCardOption<IqcDisposition>[] = [
  {
    value: IqcDisposition.CONCESSION,
    label: iqcDispositionLabels[IqcDisposition.CONCESSION],
    description: iqcDispositionDescriptions[IqcDisposition.CONCESSION],
    icon: DangerTriangle,
    activeClassName: "border-amber-500",
    chipClassName:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    badgeClassName: "bg-amber-500 text-white",
  },
  {
    value: IqcDisposition.SORT,
    label: iqcDispositionLabels[IqcDisposition.SORT],
    description: iqcDispositionDescriptions[IqcDisposition.SORT],
    icon: Layers,
    activeClassName: "border-violet-500",
    chipClassName:
      "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
    badgeClassName: "bg-violet-500 text-white",
  },
  {
    value: IqcDisposition.RETURN,
    label: iqcDispositionLabels[IqcDisposition.RETURN],
    description: iqcDispositionDescriptions[IqcDisposition.RETURN],
    icon: Delivery,
    activeClassName: "border-foreground/40",
    chipClassName: "bg-foreground/10 text-foreground",
    badgeClassName: "bg-foreground text-background",
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
// Hàng sinh từ phiếu RETURN gắn khách hàng (không có `supplier`) không có phương án trả-lại-khách
// — server chặn cứng (E254, `resolveConfirmIqcErrorMessage`), ẩn luôn SORT/RETURN khỏi UI thay vì
// để chọn rồi báo lỗi sau khi lưu.
export function IqcDispositionCard({
  form,
  iqc,
  disabled,
}: IqcDispositionCardProps) {
  const canReturnToSupplier = iqc.supplier !== null
  const options = canReturnToSupplier
    ? dispositionOptions
    : dispositionOptions.filter(
        (option) => option.value === IqcDisposition.CONCESSION
      )

  return (
    <IqcDetailSectionCard
      icon={ChecklistMinimalistic}
      title="Quyết định xử lý"
      description="Chọn hướng xử lý cho lô hàng không đạt (FAIL)"
    >
      <div className="space-y-4">
        {!canReturnToSupplier && (
          <p className="rounded-lg bg-muted px-3 py-2.5 text-xs font-medium text-muted-foreground">
            Hàng khách trả — chưa có phương án trả-lại-khách, chỉ chọn được
            "Chấp nhận có điều kiện".
          </p>
        )}

        <form.Field name="disposition">
          {(field) => (
            <RadioCardField
              field={field}
              options={options}
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
