import { useMemo } from "react"
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
import { TableEmptyRow } from "@/components/shared/TableEmptyRow"
import { buildQuotationAddSupplierItemsColumns } from "@/features/purchase-quotations/components/create/QuotationAddSupplierItemsColumns"
import { cn } from "@/lib/utils"
import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

type QuotationAddSupplierItemsProps = {
  items: PickedQuotationItemValue[]
  checkedIds: Set<string>
  assignedIds: Set<string>
  allChecked: boolean
  onToggleItem: (purchaseRequestItemId: string) => void
  onToggleAll: (checked: boolean) => void
}

// Presentational data table for QuotationAddSupplierDialog — the dialog owns all state (which
// supplier is picked, which items are checked), this only renders it and reports taps. Row style
// mirrors CreateQuotationItemsPickerSection.tsx's picker table (whole-row click toggles, with
// stopPropagation on the select cell so the checkbox's own change doesn't double-fire) — but with
// hover/focus background effects deliberately dropped: a static bg-primary/5 tint marks a checked
// row instead, so selection stays legible without hover.
export function QuotationAddSupplierItems({
  items,
  checkedIds,
  assignedIds,
  allChecked,
  onToggleItem,
  onToggleAll,
}: QuotationAddSupplierItemsProps) {
  const newCount = items.filter(
    (item) =>
      checkedIds.has(item.purchaseRequestItemId) &&
      !assignedIds.has(item.purchaseRequestItemId)
  ).length

  const columns = useMemo(
    () =>
      buildQuotationAddSupplierItemsColumns({
        checkedIds,
        assignedIds,
        allChecked,
        onToggleItem,
        onToggleAll,
      }),
    [checkedIds, assignedIds, allChecked, onToggleItem, onToggleAll]
  )

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-1.5">
      <p className="text-right text-xs text-muted-foreground">
        Sẽ thêm cho {newCount} vật tư
      </p>

      <div className="overflow-hidden rounded-md border border-border/50 bg-card">
        <div className="max-h-80 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/45">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="h-10 hover:bg-transparent"
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
                <TableEmptyRow
                  colSpan={columns.length}
                  message="Chưa có vật tư nào"
                />
              ) : (
                table.getRowModel().rows.map((row) => {
                  const isAssigned = assignedIds.has(
                    row.original.purchaseRequestItemId
                  )
                  const isChecked = checkedIds.has(
                    row.original.purchaseRequestItemId
                  )

                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "h-12 hover:bg-transparent",
                        isAssigned
                          ? "cursor-not-allowed text-muted-foreground"
                          : "cursor-pointer",
                        isChecked && !isAssigned && "bg-primary/5"
                      )}
                      onClick={() =>
                        !isAssigned &&
                        onToggleItem(row.original.purchaseRequestItemId)
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cell.column.columnDef.meta?.cellClassName}
                          onClick={(event) =>
                            cell.column.id === "select" &&
                            event.stopPropagation()
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
