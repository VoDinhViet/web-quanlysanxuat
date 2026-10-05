import { Box, PackageSearch } from "lucide-react"
import { useMemo } from "react"
import type { ReactNode } from "react"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"

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
import { buildPurchaseOrderItemColumns } from "@/features/purchase-orders/components/composites/PurchaseOrderItemsTableColumns"
import { currencyFormatter } from "@/lib/currency"
import { cn } from "@/lib/utils"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderItemsSectionProps = {
  purchaseOrder: PurchaseOrderDetail
  editable: boolean
  // Khối thanh toán (PurchaseOrderCostsSection) nằm dưới bảng, trong cùng thẻ.
  children?: ReactNode
}

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Thẻ "Chi tiết vật tư" cùng khuôn OrderDetailItemsCard: icon + tiêu đề font-heading, bảng trong
// khung viền có dòng "Tổng cộng" ở chân, khối thanh toán bên dưới. No pagination — a PO's line
// count is small and comes back in one response.
export function PurchaseOrderItemsSection({
  purchaseOrder,
  editable,
  children,
}: PurchaseOrderItemsSectionProps) {
  const columns = useMemo(
    () => buildPurchaseOrderItemColumns(editable),
    [editable]
  )

  // BE không orderBy items — sắp theo mã vật tư (rồi mã PR) để các dòng cùng vật tư (tách từ
  // cùng 1 dòng RFQ gộp) đứng cạnh nhau, thay vì rải rác theo thứ tự BE trả về.
  const items = useMemo(
    () =>
      [...purchaseOrder.items].sort((a, b) => {
        const itemCodeCompare = a.purchaseRequestItem.item.code.localeCompare(
          b.purchaseRequestItem.item.code
        )
        if (itemCodeCompare !== 0) return itemCodeCompare

        return a.purchaseRequestItem.purchaseRequest.code.localeCompare(
          b.purchaseRequestItem.purchaseRequest.code
        )
      }),
    [purchaseOrder.items]
  )

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalReceived = items.reduce(
    (sum, item) => sum + item.receivedQuantity,
    0
  )
  const totalRemaining = Math.max(totalQuantity - totalReceived, 0)

  const table = useTable({
    data: items,
    columns,
    features: appTableFeatures,
  })

  return (
    <section className="h-fit overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <Box className="size-4 text-muted-foreground" />
        Chi tiết vật tư ({items.length})
      </div>

      <div className="p-4 sm:p-5">
        {items.length === 0 ? (
          <TableEmpty
            icon={PackageSearch}
            title="Chưa có vật tư nào"
            description="Đơn mua hàng này chưa có dòng vật tư nào."
          />
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
              <Table aria-label="Chi tiết vật tư">
                <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
                  <TableRow>
                    {table.getFlatHeaders().map((header) => (
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
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="h-14 bg-card hover:bg-muted/25"
                    >
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
                      colSpan={4}
                      className="font-semibold text-foreground"
                    >
                      Tổng cộng
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground tabular-nums">
                      {quantityFormatter.format(totalQuantity)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {quantityFormatter.format(totalReceived)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        totalRemaining > 0 && "font-semibold text-foreground"
                      )}
                    >
                      {quantityFormatter.format(totalRemaining)}
                    </TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell className="text-right text-sm font-semibold text-foreground tabular-nums">
                      {currencyFormatter.format(purchaseOrder.subtotal)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            {children}
          </div>
        )}
      </div>
    </section>
  )
}
