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
import { buildCreateOrderQuantitiesColumns } from "@/features/orders/components/composites/CreateOrderQuantitiesColumns"
import { createOrderFormDefaultValues } from "@/features/orders/schemas/create-order.schema"
import { withForm } from "@/hooks/use-app-form"

// Nửa đầu bước ③ đã gộp (CreateOrderStepsTabs.tsx): đúng những sản phẩm đã tick ở bước ②
// (CreateOrderSelectItemsStep.tsx), mọi field nhập tay đều inline ngay trong bảng
// (NumericCellInput cho SL/giá/CK, TableTextCellInput cho ghi chú — cả 2 commit lúc blur) —
// không còn dialog sửa dòng riêng. Cột định nghĩa ở CreateOrderQuantitiesColumns.tsx, cùng khuôn
// PurchaseRequestCreateQuantitySection.tsx. Không có cột "Trạng thái" (khác
// UpdateOrderQuantitiesStep.tsx): mọi dòng mới luôn NORMAL, chỉ có ý nghĩa thật khi huỷ 1 dòng
// trên đơn đã tồn tại.
export const CreateOrderQuantitiesStep = withForm({
  defaultValues: createOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    // `useField`, không phải `form.Field`'s render-prop — useTable/useMemo dưới là hook thật,
    // chỉ gọi được ở top level component. Cùng idiom PurchaseRequestCreateQuantitySection.tsx.
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value
    const currency = useField({ form, name: "currency" }).state.value

    const columns = useMemo(
      () =>
        buildCreateOrderQuantitiesColumns({ itemsField, disabled, currency }),
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
