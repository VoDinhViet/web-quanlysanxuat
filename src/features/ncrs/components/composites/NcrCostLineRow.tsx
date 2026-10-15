import { Trash2 } from "lucide-react"
import { NumericFormat } from "react-number-format"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ncrCostKindLabels } from "@/lib/types/ncr.type"
import type { NcrCostKind } from "@/lib/types/ncr.type"
import { buildOptionsFromLabels } from "@/lib/utils"

// Editable cost line (the `id`/`amount` of a saved line are server-owned; `key` is only a React
// key for rows the user adds before saving).
export type NcrCostLineDraft = {
  key: string
  kind: NcrCostKind
  description: string
  itemId: string | null
  quantity: number
  unitPrice: number
}

type NcrCostLineRowProps = {
  draft: NcrCostLineDraft
  isLocked: boolean
  onChange: (patch: Partial<NcrCostLineDraft>) => void
  onRemove: () => void
}

type CostCellProps = {
  label: string
  className?: string
  children: ReactNode
}

// Shared by the column header and every row so the columns line up.
export const costLineGridClass =
  "sm:grid-cols-[9.5rem_minmax(0,1fr)_5.5rem_8.5rem_8.5rem_2.25rem]"

const currencyFormatter = new Intl.NumberFormat("vi-VN")
const kindOptions = buildOptionsFromLabels(ncrCostKindLabels)

// Below `sm` the column header is hidden, so each cell carries its own visible label.
function CostCell({ label, className, children }: CostCellProps) {
  return (
    <div className={className}>
      <span className="mb-1 block text-xs font-medium text-foreground/70 sm:hidden">
        {label}
      </span>
      {children}
    </div>
  )
}

export function NcrCostLineRow({
  draft,
  isLocked,
  onChange,
  onRemove,
}: NcrCostLineRowProps) {
  return (
    <div
      className={`grid grid-cols-2 items-end gap-x-2 gap-y-3 rounded-lg border border-border p-3 sm:items-center sm:rounded-none sm:border-0 sm:p-0 ${costLineGridClass}`}
    >
      <CostCell label="Loại chi phí" className="col-span-2 sm:col-span-1">
        <Select
          items={kindOptions}
          value={draft.kind}
          disabled={isLocked}
          onValueChange={(value) => value !== null && onChange({ kind: value })}
        >
          <SelectTrigger className="w-full text-xs" aria-label="Loại chi phí">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {kindOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CostCell>
      <CostCell label="Diễn giải" className="col-span-2 sm:col-span-1">
        <Input
          className="text-xs"
          aria-label="Diễn giải"
          placeholder="VD: Thép tấm 3mm, công hàn lại..."
          value={draft.description}
          disabled={isLocked}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </CostCell>
      <CostCell label="Số lượng">
        <NumericFormat
          customInput={Input}
          className="text-right text-xs tabular-nums"
          aria-label="Số lượng"
          placeholder="0"
          value={draft.quantity === 0 ? "" : draft.quantity}
          thousandSeparator="."
          decimalSeparator=","
          allowNegative={false}
          disabled={isLocked}
          onValueChange={(values) =>
            onChange({ quantity: values.floatValue ?? 0 })
          }
        />
      </CostCell>
      <CostCell label="Đơn giá (đ)">
        <NumericFormat
          customInput={Input}
          className="text-right text-xs tabular-nums"
          aria-label="Đơn giá"
          placeholder="0"
          value={draft.unitPrice === 0 ? "" : draft.unitPrice}
          thousandSeparator="."
          decimalSeparator=","
          allowNegative={false}
          disabled={isLocked}
          onValueChange={(values) =>
            onChange({ unitPrice: values.floatValue ?? 0 })
          }
        />
      </CostCell>
      <CostCell label="Thành tiền (đ)" className="col-span-2 sm:col-span-1">
        <p className="text-right text-sm font-medium text-foreground tabular-nums sm:px-1">
          {currencyFormatter.format(draft.quantity * draft.unitPrice)}
        </p>
      </CostCell>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="col-span-2 justify-self-end sm:col-span-1"
        aria-label="Xóa dòng dự toán"
        disabled={isLocked}
        onClick={onRemove}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}
