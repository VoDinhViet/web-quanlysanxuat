import { TrashBinTrash } from "@solar-icons/react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { PurchaseRequestItemImageCell } from "@/features/purchase-requests/components/primitives/PurchaseRequestItemCells"
import type { Direct } from "@/lib/types/direct.type"

export type PurchaseRequestItemDraft = {
  direct: Direct
  quantity: number | undefined
}

type CreatePurchaseRequestItemsDetailsTableProps = {
  items: PurchaseRequestItemDraft[]
  disabled: boolean
  onQuantityChange: (itemId: string, quantity: number | undefined) => void
  onRemove: (itemId: string) => void
}

// Step 2 (enter quantities) — flat list of exactly the rows picked in step 1. A row can be
// dropped here without going back to step 1.
export function CreatePurchaseRequestItemsDetailsTable({
  items,
  disabled,
  onQuantityChange,
  onRemove,
}: CreatePurchaseRequestItemsDetailsTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
      <Table aria-label="Số lượng vật tư đã chọn">
        <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
          <TableRow>
            <TableHead className="w-14 text-center">Ảnh</TableHead>
            <TableHead className="min-w-40">Mã / Tên</TableHead>
            <TableHead className="w-16">ĐVT</TableHead>
            <TableHead className="w-36">SL đề xuất</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(({ direct, quantity }) => (
            <TableRow
              key={direct.id}
              className="h-14 bg-card hover:bg-muted/25"
            >
              <TableCell className="text-center">
                <PurchaseRequestItemImageCell
                  image={direct.image}
                  name={direct.name}
                />
              </TableCell>
              <TableCell>
                <p className="text-xs font-semibold text-foreground">
                  {direct.name}
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {direct.code}
                </p>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {direct.unit.name}
              </TableCell>
              <TableCell>
                <NumericCellInput
                  value={quantity}
                  min={0.001}
                  disabled={disabled}
                  onValueChange={(value) => onQuantityChange(direct.id, value)}
                />
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Bỏ chọn ${direct.name}`}
                        className="border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                        disabled={disabled}
                        onClick={() => onRemove(direct.id)}
                      >
                        <TrashBinTrash className="size-3.5" />
                      </Button>
                    }
                  />
                  <TooltipContent>Bỏ chọn</TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
