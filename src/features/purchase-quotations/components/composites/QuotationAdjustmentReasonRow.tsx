import { TableCell, TableRow } from "@/components/ui/table"
import { QuotationTreeGuide } from "@/features/purchase-quotations/components/composites/QuotationTreeGuide"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import { cn } from "@/lib/utils"

type QuotationAdjustmentReasonRowProps = {
  itemIndex: number
  reason: string
  isOver: boolean
  needsReason: boolean
  disabled?: boolean
  onChange: (reason: string) => void
}

// Child row under a vật tư whose SL báo giá differs from the request (single-allocation only —
// a merged vật tư edits its reasons in QuotationAllocationsDialog). Required when over.
export function QuotationAdjustmentReasonRow({
  itemIndex,
  reason,
  isOver,
  needsReason,
  disabled,
  onChange,
}: QuotationAdjustmentReasonRowProps) {
  return (
    <TableRow className="h-12 border-b-0 bg-warning/5 hover:bg-warning/5">
      <QuotationTreeGuide />
      <TableCell colSpan={9}>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "shrink-0 text-xs font-medium",
              isOver ? "text-warning" : "text-muted-foreground"
            )}
          >
            {isOver
              ? "SL báo giá vượt SL cần mua — lý do *"
              : "Lý do SL báo giá khác SL cần mua"}
          </span>
          <div className="max-w-xl flex-1">
            <TableTextCellInput
              id={`quotation-item-adjustment-reason-${itemIndex}`}
              value={reason}
              placeholder="Nhập lý do"
              className={cn(
                needsReason && "border-warning/60 focus-visible:ring-warning/30"
              )}
              disabled={disabled}
              onValueChange={onChange}
            />
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}
