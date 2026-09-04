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
import { buildPurchaseRequestQuantityColumns } from "@/features/purchase-requests/components/composites/PurchaseRequestCreateQuantityColumns"
import { createPurchaseRequestFormDefaultValues } from "@/features/purchase-requests/schemas/create-purchase-request.schema"
import { withForm } from "@/hooks/use-app-form"

export const PurchaseRequestCreateQuantitySection = withForm({
  defaultValues: createPurchaseRequestFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    // `useField`, not `form.Field`'s render-prop — useReactTable/useMemo below are real hooks,
    // same reasoning as PurchaseRequestCreateMaterialPickerSection.tsx.
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const columns = useMemo(
      () => buildPurchaseRequestQuantityColumns({ itemsField, disabled }),
      [itemsField, disabled]
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
            Số lượng đề xuất
          </h2>
          <p className="text-sm text-muted-foreground">
            Nhập số lượng cần mua cho từng vật tư.
          </p>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách vật tư">
            <TableHeader
              columns={table.getFlatHeaders()}
              className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45"
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
                  title="Chưa chọn vật tư nào"
                  description="Quay lại tab “Chọn vật tư” để bắt đầu."
                />
              )}
            >
              {(row) => (
                <TableRow
                  id={row.original.itemId}
                  className="h-16 bg-card hover:bg-muted/25"
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
