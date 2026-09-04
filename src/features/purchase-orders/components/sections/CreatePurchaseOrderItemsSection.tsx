import { useMemo } from "react"
import { useField } from "@tanstack/react-form"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { buildPurchaseOrderItemsColumns } from "@/features/purchase-orders/components/composites/CreatePurchaseOrderItemsColumns"
import { createPurchaseOrderFormDefaultValues } from "@/features/purchase-orders/schemas/create-purchase-order.schema"
import { withForm } from "@/hooks/use-app-form"

export const CreatePurchaseOrderItemsSection = withForm({
  defaultValues: createPurchaseOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const columns = useMemo(
      () => buildPurchaseOrderItemsColumns({ itemsField, disabled }),
      [itemsField, disabled]
    )

    const table = useTable({
      data: items,
      columns,
      features: appTableFeatures,
    })

    return (
      <div className="px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Dòng đặt mua
            </h2>
            <p className="text-sm text-muted-foreground">
              Sửa SL đặt mua/đơn giá trực tiếp trên bảng — đơn giá có thể để
              trống, nhập sau khi xác nhận đặt hàng
            </p>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {items.length} dòng
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách dòng đặt mua">
            <TableHeader
              columns={table.getFlatHeaders()}
              className="[&>tr]:h-11 [&>tr]:hover:bg-muted/45"
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
            <TableBody
              items={table.getRowModel().rows}
              renderEmptyState={() => (
                <TableEmpty
                  colSpan={columns.length}
                  title="Chưa chọn dòng đề xuất nào"
                />
              )}
            >
              {(row) => (
                <TableRow
                  id={row.original.purchaseRequestItemId}
                  className="h-14 bg-card hover:bg-muted/25"
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
          </Table>
        </div>
      </div>
    )
  },
})
