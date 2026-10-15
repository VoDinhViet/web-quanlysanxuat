import { Diskette, HandMoney, Notes } from "@solar-icons/react"
import { Loader2 } from "lucide-react"
import { NumericFormat } from "react-number-format"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { currencyFormatter } from "@/lib/currency"

type ExtraCost = {
  extraCost: number
  extraCostNote: string | null
}

type PaymentRequestExtraCostFieldProps = {
  extraCost?: number
  extraCostNote?: string | null
  currentExtraCost: number
  currentExtraCostNote: string
  editable: boolean
  hasUnsavedChanges?: boolean
  isSaving?: boolean
  onExtraCostChange: (value: ExtraCost) => void
  onSave?: () => void
  onRevert?: () => void
}

export function PaymentRequestExtraCostField({
  extraCost = 0,
  extraCostNote = "",
  currentExtraCost,
  currentExtraCostNote,
  editable,
  hasUnsavedChanges = false,
  isSaving = false,
  onExtraCostChange,
  onSave,
  onRevert,
}: PaymentRequestExtraCostFieldProps) {
  if (!editable) {
    if (!extraCost && !extraCostNote) return null

    return (
      <div className="min-w-0 space-y-1 text-xs">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <HandMoney className="size-4 text-muted-foreground" />
          Chi phí phát sinh:
          <span className="font-semibold text-primary tabular-nums">
            + {currencyFormatter.format(extraCost)} VND
          </span>
        </span>
        {extraCostNote && (
          <p className="whitespace-pre-line pl-5.5 italic text-muted-foreground">
            Lý do: {extraCostNote}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="payment-request-extra-cost"
            className="flex items-center gap-1.5 text-xs font-medium text-foreground"
          >
            <HandMoney className="size-4 text-muted-foreground" />
            Số tiền phát sinh
          </label>
          {!!currentExtraCost && (
            <span className="text-[11px] font-medium text-primary">
              + {currencyFormatter.format(currentExtraCost)} ₫
            </span>
          )}
        </div>
        <NumericFormat
          id="payment-request-extra-cost"
          customInput={Input}
          thousandSeparator="."
          decimalSeparator=","
          suffix=" ₫"
          allowNegative={false}
          decimalScale={0}
          placeholder="0 ₫"
          className="h-8 max-w-xs bg-card font-mono text-xs tabular-nums text-foreground placeholder:font-sans placeholder:text-muted-foreground/75"
          value={currentExtraCost || ""}
          onValueChange={({ floatValue }) =>
            onExtraCostChange({
              extraCost: floatValue ?? 0,
              extraCostNote: currentExtraCostNote.trim() || null,
            })
          }
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="payment-request-extra-cost-note"
          className="flex items-center gap-1.5 text-xs font-medium text-foreground"
        >
          <Notes className="size-4 text-muted-foreground" />
          Lý do phát sinh
        </label>
        <Textarea
          id="payment-request-extra-cost-note"
          className="min-h-16 resize-y bg-card text-xs placeholder:text-muted-foreground/75"
          placeholder="Nhập lý do hoặc diễn giải chi phí phát sinh..."
          maxLength={500}
          value={currentExtraCostNote}
          onChange={(event) =>
            onExtraCostChange({
              extraCost: currentExtraCost,
              extraCostNote: event.target.value,
            })
          }
        />
      </div>

      {hasUnsavedChanges && (
        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={onSave}
            className="h-8 gap-1.5 text-xs"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Diskette className="size-3.5" />
            )}
            Lưu phát sinh
          </Button>
          {onRevert && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isSaving}
              onClick={onRevert}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Hoàn tác
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
