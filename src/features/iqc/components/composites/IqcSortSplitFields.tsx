import type { IqcDetailFormApi } from "@/features/iqc/hooks/use-iqc-detail-form"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// numeric(18,3) on the backend — comparing/deriving raw floats risks 0.1+0.2 !== 0.3 style
// mismatches. Mirrors confirm-iqc.schema.ts's own `scale`.
function roundToScale(value: number): number {
  return Math.round(value * 1000) / 1000
}

type IqcSortSplitFieldsProps = {
  form: IqcDetailFormApi
  quantity: number
  // null khi lô kiểm là node COMPONENT nhận về từ OS-IN (không phải một item, không có ĐVT) —
  // nhãn/banner bỏ hẳn phần đơn vị thay vì hiện ngoặc rỗng.
  unitName: string | null
  disabled?: boolean
}

// Only rendered when disposition = SORT (see IqcDispositionCard.tsx). QC chỉ nhập SL NG (trả
// NCC) — SL OK tự tính = Tổng SL − SL NG qua `listeners.onChange`, khớp sẵn CHECK
// `chk_quality_inspection_results_sort_qty_total` ở backend nên không còn cảnh gõ tay 2 số rồi
// tự cộng lệch tổng. `sortOkQty` vẫn là field thật trong form (gửi cùng `sortNgQty` lên
// confirm-iqc), chỉ không còn ô nhập trực tiếp.
export function IqcSortSplitFields({
  form,
  quantity,
  unitName,
  disabled,
}: IqcSortSplitFieldsProps) {
  const unitSuffix = unitName ? ` (${unitName})` : ""

  return (
    <div className="space-y-3 rounded-lg border border-violet-200 bg-violet-50/50 p-3.5 dark:border-violet-500/20 dark:bg-violet-500/5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.AppField
          name="sortNgQty"
          listeners={{
            onChange: ({ value }) => {
              const okQty =
                value === undefined ? undefined : roundToScale(quantity - value)
              form.setFieldValue("sortOkQty", okQty)
            },
          }}
        >
          {(field) => (
            <field.NumberField
              label={`SL NG${unitSuffix} — trả NCC`}
              required
              placeholder="0"
              thousandSeparator={false}
              disabled={disabled}
            />
          )}
        </form.AppField>

        <form.Subscribe selector={(state) => state.values.sortNgQty}>
          {(sortNgQty) => {
            const okQty =
              sortNgQty === undefined
                ? undefined
                : roundToScale(quantity - sortNgQty)
            const isInvalid = okQty !== undefined && okQty < 0

            return (
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">
                  SL OK{unitSuffix}
                </p>
                <div
                  className={cn(
                    "flex h-9 items-center rounded-md border border-dashed px-3 text-xs font-medium",
                    isInvalid
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-border bg-muted/40 text-muted-foreground"
                  )}
                >
                  {okQty === undefined ? "—" : quantityFormatter.format(okQty)}
                  <span className="ml-1.5 text-[10px] font-normal">
                    (tự tính)
                  </span>
                </div>
              </div>
            )
          }}
        </form.Subscribe>
      </div>

      <form.Subscribe selector={(state) => state.values.sortNgQty}>
        {(sortNgQty) => {
          const isInvalid = sortNgQty !== undefined && sortNgQty > quantity

          if (isInvalid) {
            return (
              <p className="rounded-md bg-destructive/10 px-2.5 py-2 text-xs font-medium text-destructive">
                ✗ SL NG không được vượt quá Tổng SL (
                {quantityFormatter.format(quantity)}
                {unitName ? ` ${unitName}` : ""})
              </p>
            )
          }

          return (
            <p className="rounded-md bg-background/60 px-2.5 py-2 text-xs font-medium text-muted-foreground">
              Tổng SL = {quantityFormatter.format(quantity)}
              {unitName ? ` ${unitName}` : ""}
            </p>
          )
        }}
      </form.Subscribe>
    </div>
  )
}
