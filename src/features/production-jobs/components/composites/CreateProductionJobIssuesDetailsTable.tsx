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
import { ItemCell } from "@/features/production-jobs/components/composites/ProductionJobItemPickerColumns"
import type { ProductionJobItemPickerRow } from "@/features/production-jobs/components/composites/ProductionJobItemPickerColumns"

export type ProductionJobIssueDraft = {
  row: ProductionJobItemPickerRow
  quantity: number | undefined
}

type CreateProductionJobIssuesDetailsTableProps = {
  items: ProductionJobIssueDraft[]
  disabled: boolean
  onQuantityChange: (itemId: string, quantity: number | undefined) => void
  onRemove: (itemId: string) => void
}

// Step 2 (enter quantities) — flat list of exactly the rows picked in step 1. A row can be
// dropped here without going back to step 1.
export function CreateProductionJobIssuesDetailsTable({
  items,
  disabled,
  onQuantityChange,
  onRemove,
}: CreateProductionJobIssuesDetailsTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
      <Table aria-label="Số lượng vật tư đã chọn">
        <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
          <TableRow>
            <TableHead className="min-w-40">Mã / Tên</TableHead>
            <TableHead className="w-16">ĐVT</TableHead>
            <TableHead className="w-32">Số lượng cần</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.row.id}
              className="h-14 bg-card hover:bg-muted/25"
            >
              <TableCell>
                <ItemCell item={item.row} />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {item.row.unit.name}
              </TableCell>
              <TableCell>
                <NumericCellInput
                  value={item.quantity}
                  disabled={disabled}
                  onValueChange={(value) =>
                    onQuantityChange(item.row.id, value)
                  }
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
                        aria-label={`Bỏ chọn ${item.row.name}`}
                        className="border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                        disabled={disabled}
                        onClick={() => onRemove(item.row.id)}
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
