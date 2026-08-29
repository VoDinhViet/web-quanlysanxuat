import { useMemo } from "react"
import { useField } from "@tanstack/react-form"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { buildCreateOutsourcingReceiptItemColumns } from "@/features/outsourcing-receipts/components/create/CreateOutsourcingReceiptItemsColumns"
import { sumOutsourcingReceiptItemTotals } from "@/features/outsourcing-receipts/logic/outsourcing-receipt-item-totals"
import { createOutsourcingReceiptFormDefaultValues } from "@/features/outsourcing-receipts/schemas/create-outsourcing-receipt.schema"
import { withForm } from "@/hooks/use-app-form"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const decimalFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
})

// Bước ② — bảng nhập SL nhận/trọng lượng/diện tích/ghi chú cho từng dòng đã chọn ở bước ①, cộng
// ngày nhận + yêu cầu QC cho cả phiếu ở cuối bước (khớp layout ảnh mẫu — bước nhập SL gộp chung 2
// nhóm này thay vì tách tab info riêng như CreateOutsourcingOrderInfoSection.tsx).
export const CreateOutsourcingReceiptItemsSection = withForm({
  defaultValues: createOutsourcingReceiptFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    // `useField`, không phải `form.Field`'s render-prop — useReactTable/useMemo bên dưới là hook
    // thật, cùng lý do CreateOutsourcingReceiptPickerSection.tsx.
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const columns = useMemo(
      () => buildCreateOutsourcingReceiptItemColumns({ itemsField, disabled }),
      [itemsField, disabled]
    )

    const table = useReactTable({
      data: items,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })

    const { totalQuantity, totalWeight, totalArea } =
      sumOutsourcingReceiptItemTotals(items)

    return (
      <div className="px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              ② Số lượng nhận thực tế
            </h2>
            <p className="text-sm text-muted-foreground">
              Trọng lượng/diện tích mặc định lấy theo phiếu OS-OUT, có thể chỉnh
              sửa.
            </p>
          </div>
          {items.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="text-xs text-destructive hover:bg-destructive/10"
              disabled={disabled}
              onClick={() => itemsField.setValue([])}
            >
              <Trash2 className="size-3.5" />
              Xóa tất cả dòng
            </Button>
          )}
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-border/50 bg-card">
          <Table className="min-w-[980px]">
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
                  description="Quay lại bước ① để chọn hàng cần nhận."
                />
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.original.outsourcingOrderItemId}
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
              Tổng SL nhận:{" "}
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

        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 border-t border-border pt-5 sm:grid-cols-2">
          <form.AppField name="receiptDate">
            {(field) => (
              <field.DateField label="Ngày nhận" required disabled={disabled} />
            )}
          </form.AppField>

          <form.AppField name="requiresIqc">
            {(field) => (
              <field.SwitchField
                label="Yêu cầu QC"
                onLabel="Có"
                offLabel="Không"
                disabled={disabled}
              />
            )}
          </form.AppField>
        </div>
      </div>
    )
  },
})
