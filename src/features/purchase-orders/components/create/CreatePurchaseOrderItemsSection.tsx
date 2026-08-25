import { useMemo } from "react"
import { useField } from "@tanstack/react-form"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { buildPurchaseOrderItemsColumns } from "@/features/purchase-orders/components/create/CreatePurchaseOrderItemsColumns"
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

    const table = useReactTable({
      data: items,
      columns,
      getCoreRowModel: getCoreRowModel(),
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
              {items.length === 0 ? (
                <TableEmpty
                  colSpan={columns.length}
                  title="Chưa chọn dòng đề xuất nào"
                />
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.original.purchaseRequestItemId}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  },
})
