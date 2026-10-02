import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { vndFormatter } from "@/lib/currency"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

export type PurchaseOrderClosePreviewRow = {
  id: string
  itemCode: string
  itemName: string
  unitName: string
  ordered: number
  received: number
  amount: number
  isRemoved: boolean
  isReduced: boolean
}

type PurchaseOrderCloseTableProps = {
  rows: PurchaseOrderClosePreviewRow[]
}

// Before/after preview of what closePurchaseOrder will do to each line. Same columns/styling as
// PurchaseOrderItemsTableColumns.tsx (Mã/Tên vật tư, ĐVT, right-aligned quantities).
export function PurchaseOrderCloseTable({
  rows,
}: PurchaseOrderCloseTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
      <Table aria-label="Xem trước phần chốt của đơn mua hàng">
        <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
          <TableRow>
            <TableHead className="min-w-32">Mã vật tư</TableHead>
            <TableHead className="min-w-44">Tên vật tư</TableHead>
            <TableHead className="w-20">ĐVT</TableHead>
            <TableHead className="w-24 text-right">SL đặt</TableHead>
            <TableHead className="w-24 text-right">SL đã nhận</TableHead>
            <TableHead className="w-24 text-right">SL chốt</TableHead>
            <TableHead className="w-32 text-right">Thành tiền</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="h-14 bg-card hover:bg-muted/25">
              <TableCell
                className={cn(
                  "font-mono font-semibold text-foreground",
                  row.isRemoved && "text-muted-foreground line-through"
                )}
              >
                {row.itemCode}
              </TableCell>
              <TableCell
                className={cn(
                  "font-medium text-foreground",
                  row.isRemoved && "text-muted-foreground line-through"
                )}
              >
                {row.itemName}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.unitName}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {quantityFormatter.format(row.ordered)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {quantityFormatter.format(row.received)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-semibold tabular-nums",
                  row.isReduced && "text-destructive",
                  row.isRemoved && "font-medium text-muted-foreground"
                )}
              >
                {row.isRemoved
                  ? "Bỏ dòng"
                  : quantityFormatter.format(row.received)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-semibold text-foreground tabular-nums",
                  row.isRemoved && "text-muted-foreground"
                )}
              >
                {vndFormatter.format(row.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
