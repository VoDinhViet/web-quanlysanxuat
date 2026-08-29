import { Box } from "@solar-icons/react"
import { PackageSearch } from "lucide-react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

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
import { OrderDetailPaymentSummary } from "@/features/orders/components/composites/OrderDetailPaymentSummary"
import { OrderDetailSectionCard } from "@/features/orders/components/layouts/OrderDetailSectionCard"
import { orderDetailItemColumns } from "@/features/orders/components/composites/OrderDetailItemsTableColumns"
import { currencyFormatter } from "@/lib/currency"
import type { OrderDetail, OrderItem } from "@/lib/types/order.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type OrderDetailItemsCardProps = {
  order: OrderDetail
  items: OrderItem[]
}

export function OrderDetailItemsCard({
  order,
  items,
}: OrderDetailItemsCardProps) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalIssuedQty = items.reduce((sum, item) => sum + item.issuedQty, 0)
  const totalRemainingQty = items.reduce(
    (sum, item) => sum + item.remainingQty,
    0
  )

  const table = useReactTable({
    data: items,
    columns: orderDetailItemColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <OrderDetailSectionCard
      icon={Box}
      title={`Danh sách sản phẩm (${items.length})`}
    >
      {items.length === 0 ? (
        <TableEmpty
          icon={PackageSearch}
          title="Đơn hàng chưa có sản phẩm nào"
          description="Danh sách sản phẩm sẽ hiện ở đây khi đơn hàng được cập nhật."
        />
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-md border border-border/50">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="h-11 hover:bg-muted/45"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={
                          header.column.columnDef.meta?.headerClassName
                        }
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
                  <TableRow key={row.id} className="bg-card hover:bg-muted/25">
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
                <TableRow className="h-11">
                  <TableCell
                    colSpan={3}
                    className="font-semibold text-foreground"
                  >
                    Tổng cộng
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {quantityFormatter.format(totalQuantity)}
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell className="text-right text-sm font-semibold text-foreground tabular-nums">
                    {currencyFormatter.format(order.subtotal)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {quantityFormatter.format(totalIssuedQty)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      totalRemainingQty < 0 && "font-semibold text-destructive"
                    )}
                  >
                    {quantityFormatter.format(totalRemainingQty)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <OrderDetailPaymentSummary order={order} />
        </div>
      )}
    </OrderDetailSectionCard>
  )
}
