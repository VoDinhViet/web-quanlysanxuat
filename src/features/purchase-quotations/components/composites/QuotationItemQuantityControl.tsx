import type { AnyFieldApi } from "@tanstack/react-form"
import { DangerTriangle } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { QuotationAllocationsDialog } from "@/features/purchase-quotations/components/composites/QuotationAllocationsDialog"
import { cn } from "@/lib/utils"
import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

type QuotationItemQuantityControlProps = {
  item: PickedQuotationItemValue
  itemIndex: number
  itemsField: AnyFieldApi
  disabled?: boolean
}

// "SL báo giá" of one vật tư. A vật tư merging ≥2 dòng ĐXMH has ≥2 numbers to edit (one SL per
// allocation) — inline editing only fits a single number, so that case opens
// QuotationAllocationsDialog to edit the breakdown. The common case (1 dòng ĐXMH) edits directly.
export function QuotationItemQuantityControl({
  item,
  itemIndex,
  itemsField,
  disabled,
}: QuotationItemQuantityControlProps) {
  if (item.allocations.length > 1) {
    const total = item.allocations.reduce(
      (sum, allocation) => sum + (allocation.quantity ?? 0),
      0
    )
    const requestedTotal = item.allocations.reduce(
      (sum, allocation) => sum + allocation.requestedQuantity,
      0
    )
    const isOver = total > requestedTotal

    return (
      <Tooltip>
        <QuotationAllocationsDialog
          itemName={item.itemName}
          allocations={item.allocations}
          onSave={(allocations) =>
            itemsField.replaceValue(itemIndex, { ...item, allocations })
          }
          trigger={
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  aria-label={`${item.allocations.length} dòng ĐXMH`}
                  className={cn(
                    "h-8 w-full justify-between gap-1.5 px-2 text-xs font-normal tabular-nums transition-colors hover:border-primary hover:text-primary",
                    isOver &&
                      "border-warning/70 text-warning hover:border-warning"
                  )}
                >
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {item.allocations.length} dòng
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-semibold",
                      isOver ? "text-warning" : "text-foreground"
                    )}
                  >
                    {isOver && <DangerTriangle className="size-3 shrink-0" />}
                    {total}
                  </span>
                </Button>
              }
            />
          }
        />
        <TooltipContent>
          {isOver
            ? `Gộp từ ${item.allocations.length} dòng ĐXMH — SL vượt đề xuất (+${total - requestedTotal}). Bấm để chỉnh SL`
            : `Gộp từ ${item.allocations.length} dòng ĐXMH — Bấm để chỉnh SL`}
        </TooltipContent>
      </Tooltip>
    )
  }

  const allocation = item.allocations[0]
  const isOver = (allocation.quantity ?? 0) > allocation.requestedQuantity

  return (
    <div className="relative flex items-center">
      <NumericCellInput
        value={allocation.quantity}
        min={1}
        disabled={disabled}
        className={cn(
          "text-right tabular-nums",
          isOver &&
            "border-warning/70 pr-7 text-warning hover:border-warning focus-visible:ring-warning/30"
        )}
        onValueChange={(value) =>
          itemsField.replaceValue(itemIndex, {
            ...item,
            allocations: [{ ...allocation, quantity: value }],
          })
        }
      />
      {isOver && (
        <Tooltip>
          <TooltipTrigger
            render={
              <span className="pointer-events-auto absolute right-2 flex items-center text-warning">
                <DangerTriangle className="size-3.5 shrink-0" />
              </span>
            }
          />
          <TooltipContent>
            {`SL báo giá lớn hơn SL đề xuất (${allocation.quantity}/${allocation.requestedQuantity}, vượt +${(allocation.quantity ?? 0) - allocation.requestedQuantity})`}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
