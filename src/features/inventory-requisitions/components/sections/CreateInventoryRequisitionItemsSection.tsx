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
import { Button } from "@/components/ui/button"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { buildCreateInventoryRequisitionItemColumns } from "@/features/inventory-requisitions/components/composites/CreateInventoryRequisitionItemsColumns"
import {
  createInventoryRequisitionFormDefaultValues,
  resolveDefaultRequisitionQuantity,
} from "@/features/inventory-requisitions/schemas/create-inventory-requisition.schema"
import { withForm } from "@/hooks/use-app-form"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Bảng nhập SL lãnh + ghi chú cho các dòng đã chọn ở bước ②, cùng khuôn
// CreateInventoryReceiptFromPoItemsSection.tsx. useField, không phải form.Field's render-prop —
// useReactTable/useMemo bên dưới là hook thật.
export const CreateInventoryRequisitionItemsSection = withForm({
  defaultValues: createInventoryRequisitionFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const columns = useMemo(
      () =>
        buildCreateInventoryRequisitionItemColumns({ itemsField, disabled }),
      [itemsField, disabled]
    )

    const table = useTable({
      data: items,
      columns,
      features: appTableFeatures,
    })

    const totalQuantity = items.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0
    )

    const handleFillAllIssuable = () => {
      itemsField.setValue(
        items.map((item) => ({
          ...item,
          quantity:
            resolveDefaultRequisitionQuantity(item.line) ?? item.quantity,
        }))
      )
    }

    return (
      <div className="border-t border-border px-4 py-5 sm:px-5">
        <div className="mt-4 overflow-hidden rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách vật tư lãnh">
            <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
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
                      title="Chưa chọn vật tư nào"
                      description="Quay lại bước ② để chọn vật tư."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.original.itemId}
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
          <div className="flex items-center gap-3">
            <span>Tổng số dòng: {items.length}</span>
            {items.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-primary hover:text-primary/80"
                disabled={disabled}
                onClick={handleFillAllIssuable}
              >
                Điền tất cả theo SL có thể lãnh
              </Button>
            )}
          </div>
          <span>
            Tổng SL lãnh:{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {quantityFormatter.format(totalQuantity)}
            </span>
          </span>
        </div>
      </div>
    )
  },
})
