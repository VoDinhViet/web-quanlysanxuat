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
import { buildCreateOutsourcingOrderItemColumns } from "@/features/outsourcing-orders/components/composites/CreateOutsourcingOrderItemsColumns"
import { sumOutsourcingOrderItemTotals } from "@/features/outsourcing-orders/logic/outsourcing-order-item-totals"
import { createOutsourcingOrderFormDefaultValues } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"
import { withForm } from "@/hooks/use-app-form"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const decimalFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
})

// Nửa sau bước ② — bảng nhập SL gửi/trọng lượng/diện tích cho từng dòng đã chọn ở bước ①.
export const CreateOutsourcingOrderItemsSection = withForm({
  defaultValues: createOutsourcingOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    // `useField`, không phải `form.Field`'s render-prop — useReactTable/useMemo bên dưới là hook
    // thật, cùng lý do CreateOutsourcingOrderPickerSection.tsx.
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const columns = useMemo(
      () => buildCreateOutsourcingOrderItemColumns({ itemsField, disabled }),
      [itemsField, disabled]
    )

    const table = useTable({
      data: items,
      columns,
      features: appTableFeatures,
    })

    const { totalQuantity, totalWeight, totalArea } =
      sumOutsourcingOrderItemTotals(items)

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Danh sách chi tiết gửi gia công
          </h3>
          <p className="text-xs text-muted-foreground">
            SL gửi lần này mặc định bằng "Còn được phép gửi" — có thể chỉnh lại.
          </p>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table className="min-w-[960px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="h-12 hover:bg-muted/45"
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
                  title="Chưa có dòng nào"
                  description="Quay lại bước ① để chọn chi tiết."
                />
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.original.productionJobOperationId}
                    className="h-16 bg-card hover:bg-muted/25"
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

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Tổng số dòng: {items.length}</span>
          <div className="flex flex-wrap items-center gap-4">
            <span>
              Tổng SL gửi:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {quantityFormatter.format(totalQuantity)}
              </span>
            </span>
            <span>
              Tổng trọng lượng:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {decimalFormatter.format(totalWeight)} kg
              </span>
            </span>
            <span>
              Tổng diện tích:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {decimalFormatter.format(totalArea)} m²
              </span>
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-md bg-warning/10 p-4">
          <p className="text-xs font-semibold text-foreground">Lưu ý</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
            <li>"Còn được phép gửi" = Định mức − Đã gửi.</li>
            <li>SL gửi lần này không được vượt "Còn được phép gửi".</li>
            <li>
              Trọng lượng/Diện tích theo yêu cầu tính phí của NCC — có thể để
              trống nếu không áp dụng.
            </li>
            <li>Có thể bỏ bớt (xoá) chi tiết khỏi danh sách gửi lần này.</li>
          </ul>
        </div>
      </div>
    )
  },
})
