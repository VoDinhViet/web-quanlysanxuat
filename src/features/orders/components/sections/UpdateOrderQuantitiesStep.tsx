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
import { buildUpdateOrderQuantitiesColumns } from "@/features/orders/components/composites/UpdateOrderQuantitiesColumns"
import { updateOrderFormDefaultValues } from "@/features/orders/schemas/update-order.schema"
import { withForm } from "@/hooks/use-app-form"

// Bước ③ của wizard: đúng những sản phẩm đã tick ở bước ② (UpdateOrderSelectItemsStep.tsx), mọi
// field nhập tay đều inline ngay trong bảng — cùng khuôn CreateOrderQuantitiesStep.tsx, CỘNG
// THÊM cột "Trạng thái" mà form Tạo không có (UpdateOrderQuantitiesColumns.tsx). Không còn dialog
// sửa dòng riêng.
export const UpdateOrderQuantitiesStep = withForm({
  defaultValues: updateOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value
    const currency = useField({ form, name: "currency" }).state.value

    const columns = useMemo(
      () =>
        buildUpdateOrderQuantitiesColumns({ itemsField, disabled, currency }),
      [itemsField, disabled, currency]
    )

    const table = useTable({
      data: items,
      columns,
      features: appTableFeatures,
    })

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Số lượng & giá
          </h2>
          <p className="text-sm text-muted-foreground">
            Nhập số lượng và đơn giá cho từng sản phẩm đã chọn
          </p>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-dashed border-border/50 bg-card">
          <Table aria-label="Số lượng & giá">
            <TableHeader className="[&>tr]:h-12">
              <TableRow>
                {table.getFlatHeaders().map((header) => (
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
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <TableEmpty
                      colSpan={columns.length}
                      title="Chưa chọn sản phẩm nào"
                      description={'Quay lại bước "Chọn sản phẩm" để thêm.'}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.original.itemId} className="h-14">
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
