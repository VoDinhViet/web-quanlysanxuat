import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
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
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { OutsourcingOrderDetailSectionCard } from "@/features/outsourcing-orders/components/detail/OutsourcingOrderDetailSectionCard"
import { outsourcingOrderItemsColumns } from "@/features/outsourcing-orders/components/detail/OutsourcingOrderItemsColumns"
import type { OutsourcingOrderDetail } from "@/lib/types/outsourcing-order.type"

type OutsourcingOrderItemsCardProps = {
  detail: OutsourcingOrderDetail
}

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const decimalFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
})

// Bảng chi tiết từng dòng — không có ở OutsourcingReceiptDetailPage.tsx (OS-IN chỉ 1 dòng vật tư
// mỗi phiếu), cùng khuôn bảng bước ③ của wizard (CreateOutsourcingOrderConfirmSection.tsx).
export function OutsourcingOrderItemsCard({
  detail,
}: OutsourcingOrderItemsCardProps) {
  const items = detail.items

  const table = useReactTable({
    data: items,
    columns: outsourcingOrderItemsColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalReceivedQuantity = items.reduce(
    (sum, item) => sum + item.receivedQuantity,
    0
  )
  const totalWeight = items.reduce((sum, item) => sum + (item.weight ?? 0), 0)
  const totalArea = items.reduce((sum, item) => sum + (item.area ?? 0), 0)

  return (
    <OutsourcingOrderDetailSectionCard
      icon={ListChecks}
      title="Danh sách chi tiết gửi gia công"
      description={`${items.length} dòng · Tổng SL gửi ${quantityFormatter.format(detail.totalQuantity)}`}
      contentClassName="p-0"
    >
      <div className="overflow-x-auto">
        {items.length === 0 ? (
          <TableEmpty
            icon={PackageSearch}
            title="Chưa có dòng gửi gia công nào"
            description="Phiếu gửi gia công này chưa có dòng chi tiết nào."
          />
        ) : (
          <Table className="min-w-[1080px] table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="h-12">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={header.column.columnDef.meta?.headerClassName}
                    >
                      {!header.isPlaceholder &&
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.original.id} className="h-14">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="h-12">
                <TableCell colSpan={5} className="font-semibold">
                  Tổng
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {quantityFormatter.format(detail.totalQuantity)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {quantityFormatter.format(totalReceivedQuantity)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {quantityFormatter.format(
                    detail.totalQuantity - totalReceivedQuantity
                  )}
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
    </OutsourcingOrderDetailSectionCard>
  )
}
