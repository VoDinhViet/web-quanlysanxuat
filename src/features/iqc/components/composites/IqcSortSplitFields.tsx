import type { IqcDetailFormApi } from "@/features/iqc/hooks/use-iqc-detail-form"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// numeric(18,3) on the backend — comparing raw floats risks 0.1+0.2 !== 0.3 style mismatches.
// Mirrors confirm-iqc.schema.ts's own `scale`.
function scale(value: number): number {
  return Math.round(value * 1000)
}

type IqcSortSplitFieldsProps = {
  form: IqcDetailFormApi
  quantity: number
  unitName: string
  disabled?: boolean
}

// Only rendered when disposition = SORT (see IqcDispositionCard.tsx). SL OK/SL NG + a live
// "✓/✗ SL OK + SL NG so với Tổng SL" banner — Tổng SL is read-only, taken straight from the
// IQC's own `quantity`, not user-editable here. Same tinted-banner idiom as the live decision
// lines in IqcResultCard/IqcDispositionCard, so this reads as part of the same decision flow
// rather than a bolted-on validation hint.
export function IqcSortSplitFields({
  form,
  quantity,
  unitName,
  disabled,
}: IqcSortSplitFieldsProps) {
  return (
    <div className="space-y-3 rounded-lg border border-violet-200 bg-violet-50/50 p-3.5 dark:border-violet-500/20 dark:bg-violet-500/5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.AppField name="sortOkQty">
          {(field) => (
            <field.NumberField
              label={`SL OK (${unitName})`}
              required
              placeholder="0"
              thousandSeparator={false}
              disabled={disabled}
            />
          )}
        </form.AppField>

        <form.AppField name="sortNgQty">
          {(field) => (
            <field.NumberField
              label={`SL NG (${unitName})`}
              required
              placeholder="0"
              thousandSeparator={false}
              disabled={disabled}
            />
          )}
        </form.AppField>
      </div>

      <form.Subscribe
        selector={(state) => ({
          ok: state.values.sortOkQty,
          ng: state.values.sortNgQty,
        })}
      >
        {({ ok, ng }) => {
          const hasBoth = ok !== undefined && ng !== undefined
          const sum = (ok ?? 0) + (ng ?? 0)
          const isMatch = hasBoth && scale(sum) === scale(quantity)

          return (
            <p
              className={cn(
                "rounded-md px-2.5 py-2 text-xs font-medium",
                !hasBoth && "bg-background/60 text-muted-foreground",
                hasBoth && isMatch && "bg-success/10 text-success",
                hasBoth && !isMatch && "bg-destructive/10 text-destructive"
              )}
            >
              {hasBoth ? (isMatch ? "✓ " : "✗ ") : null}
              SL OK + SL NG = {quantityFormatter.format(sum)} / Tổng SL ={" "}
              {quantityFormatter.format(quantity)} {unitName}
            </p>
          )
        }}
      </form.Subscribe>
    </div>
  )
}
