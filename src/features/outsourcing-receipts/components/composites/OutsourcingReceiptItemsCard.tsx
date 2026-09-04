import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { ListChecks, PackageSearch } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { OutsourcingReceiptDetailSectionCard } from "@/features/outsourcing-receipts/components/layouts/OutsourcingReceiptDetailSectionCard"
import { outsourcingReceiptItemsColumns } from "@/features/outsourcing-receipts/components/composites/OutsourcingReceiptItemsColumns"
import type { OutsourcingReceiptItem } from "@/lib/types/outsourcing-receipt.type"

type OutsourcingReceiptItemsCardProps = {
  items: OutsourcingReceiptItem[]
}

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const decimalFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
})

// Bảng chi tiết từng dòng — cùng khuôn OutsourcingOrderItemsCard.tsx bên OS-OUT (một phiếu giờ
// có thể nhiều dòng, mỗi dòng ứng với một dòng OS-OUT nguồn). `totalQuantity` tự tính từ `items`
// (không lấy detail.totalQuantity — endpoint chi tiết hiện không trả field này).
export function OutsourcingReceiptItemsCard({
  items,
}: OutsourcingReceiptItemsCardProps) {
  const table = useTable({
    data: items,
    columns: outsourcingReceiptItemsColumns,
    features: appTableFeatures,
  })

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalWeight = items.reduce((sum, item) => sum + (item.weight ?? 0), 0)
  const totalArea = items.reduce((sum, item) => sum + (item.area ?? 0), 0)

  return (
    <OutsourcingReceiptDetailSectionCard
      icon={ListChecks}
      title="Danh sách dòng đã nhận"
      description={`${items.length} dòng · Tổng SL nhận ${quantityFormatter.format(totalQuantity)}`}
      contentClassName="p-0"
    >
      <div className="overflow-x-auto">
        {items.length === 0 ? (
          <TableEmpty
            icon={PackageSearch}
            title="Chưa có dòng đã nhận nào"
            description="Phiếu nhận gia công này chưa có dòng chi tiết nào."
          />
        ) : (
          <Table
            aria-label="Danh sách dòng đã nhận"
            className="min-w-[1080px] table-fixed"
          >
            <TableHeader
              columns={table.getFlatHeaders()}
              className="[&>tr]:h-12"
            >
              {(header) => (
                <TableHead
                  id={header.id}
                  isRowHeader={header.index === 0}
                  className={header.column.columnDef.meta?.headerClassName}
                >
                  {!header.isPlaceholder &&
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              )}
            </TableHeader>
            <TableBody items={table.getRowModel().rows}>
              {(row) => (
                <TableRow
                  id={row.original.id}
                  className="h-14"
                  columns={row.getVisibleCells()}
                >
                  {(cell) => (
                    <TableCell
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow className="h-12">
                <TableCell colSpan={5} className="font-semibold">
                  Tổng
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {quantityFormatter.format(totalQuantity)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {decimalFormatter.format(totalWeight)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {decimalFormatter.format(totalArea)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </div>
    </OutsourcingReceiptDetailSectionCard>
  )
}
