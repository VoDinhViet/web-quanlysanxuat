import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { OutsourcingOrderItemTotals } from "@/features/outsourcing-orders/constants/outsourcing-order-item-totals"
import type { StandaloneOutsourcingOrderItemValue } from "@/features/outsourcing-orders/schemas/standalone-outsourcing-order.schema"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const decimalFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
})

function formatOptionalDecimal(value: number | undefined) {
  return value === undefined ? "—" : decimalFormatter.format(value)
}

type StandaloneOutsourcingOrderConfirmItemsTableProps = {
  items: StandaloneOutsourcingOrderItemValue[]
  unitNameById: Map<string, string>
  totals: OutsourcingOrderItemTotals
}

// Bảng chỉ đọc ở bước ③: dòng do người dùng tự gõ, không có id nên key theo vị trí dòng.
export function StandaloneOutsourcingOrderConfirmItemsTable({
  items,
  unitNameById,
  totals,
}: StandaloneOutsourcingOrderConfirmItemsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table aria-label="Danh sách hàng gửi gia công" className="min-w-[760px]">
        <TableHeader className="[&>tr]:h-11">
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Mã hàng</TableHead>
            <TableHead>Tên hàng</TableHead>
            <TableHead>ĐVT</TableHead>
            <TableHead className="text-right">SL gửi</TableHead>
            <TableHead className="text-right">Trọng lượng (kg)</TableHead>
            <TableHead className="text-right">Diện tích (m²)</TableHead>
            <TableHead>Ghi chú</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index} className="h-12">
              <TableCell className="text-center text-muted-foreground tabular-nums">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium">{item.itemCode}</TableCell>
              <TableCell className="whitespace-normal">
                {item.itemName}
              </TableCell>
              <TableCell>{unitNameById.get(item.unitId) ?? "—"}</TableCell>
              <TableCell className="text-right tabular-nums">
                {quantityFormatter.format(item.quantity ?? 0)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatOptionalDecimal(item.weight)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatOptionalDecimal(item.area)}
              </TableCell>
              <TableCell className="whitespace-normal text-muted-foreground">
                {item.note || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="h-11">
            <TableCell colSpan={4} className="font-medium">
              Tổng
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {quantityFormatter.format(totals.totalQuantity)}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {decimalFormatter.format(totals.totalWeight)}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {decimalFormatter.format(totals.totalArea)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
