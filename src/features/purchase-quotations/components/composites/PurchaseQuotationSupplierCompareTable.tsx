import { useMemo } from "react"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"

import { RadioGroup } from "@/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buildPurchaseQuotationSupplierCompareColumns } from "@/features/purchase-quotations/components/composites/PurchaseQuotationSupplierCompareColumns"
import { cn } from "@/lib/utils"
import type { PurchaseQuotationItemDetail } from "@/lib/types/purchase-quotation.type"

type PurchaseQuotationSupplierCompareTableProps = {
  item: PurchaseQuotationItemDetail
  selectable: boolean
  selectedSupplierId: string | undefined
  onSelectSupplier: (quotationItemSupplierId: string) => void
  isApproved: boolean
}

export function PurchaseQuotationSupplierCompareTable({
  item,
  selectable,
  selectedSupplierId,
  onSelectSupplier,
  isApproved,
}: PurchaseQuotationSupplierCompareTableProps) {
  // Tìm đơn giá thấp nhất và thời gian giao ngắn nhất để gắn nhãn gợi ý
  const { minPrice, minLeadTime } = useMemo(() => {
    const validPrices = item.suppliers
      .map((s) => s.unitPrice)
      .filter((p): p is number => p !== null && p !== undefined)

    const validLeadTimes = item.suppliers
      .map((s) => s.leadTimeDays)
      .filter((d): d is number => d !== null && d !== undefined)

    return {
      minPrice: validPrices.length > 1 ? Math.min(...validPrices) : undefined,
      minLeadTime:
        validLeadTimes.length > 1 ? Math.min(...validLeadTimes) : undefined,
    }
  }, [item.suppliers])

  const columns = useMemo(
    () =>
      buildPurchaseQuotationSupplierCompareColumns({
        selectable,
        isApproved,
        itemQuantity: item.quantity,
        itemUnit: item.item?.unit?.name,
        minPrice,
        minLeadTime,
      }),
    [
      selectable,
      isApproved,
      item.quantity,
      item.item?.unit?.name,
      minPrice,
      minLeadTime,
    ]
  )

  const table = useTable({
    data: item.suppliers,
    columns,
    features: appTableFeatures,
  })

  const tableElement = (
    <div className="overflow-x-auto">
      <Table aria-label="So sánh báo giá NCC" className="min-w-full">
        {item.suppliers.length > 0 && (
          <TableHeader className="bg-transparent [&>tr]:h-8 [&>tr]:bg-transparent [&>tr]:hover:bg-transparent">
            <TableRow>
              {table.getFlatHeaders().map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "border-b border-primary/15 text-xs font-medium text-muted-foreground",
                    header.column.columnDef.meta?.headerClassName
                  )}
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
        )}
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const isWon = isApproved && row.original.selectedAt !== null
            const isSelected = row.original.id === selectedSupplierId

            return (
              <TableRow
                key={row.id}
                className={cn(
                  "h-auto min-h-[50px] transition-colors",
                  isWon && "bg-success/5 hover:bg-success/10 font-medium",
                  isSelected && "bg-primary/5 hover:bg-primary/10",
                  !isWon && !isSelected && "hover:bg-muted/15"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "border-b border-primary/15 py-2",
                      cell.column.columnDef.meta?.cellClassName
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}

          {item.suppliers.length === 0 && (
            <TableRow
              key="empty"
              className="h-11 border-none hover:bg-transparent"
            >
              <TableCell
                colSpan={columns.length}
                className="py-3 text-center text-xs text-muted-foreground"
              >
                Chưa có nhà cung cấp nào gửi báo giá cho vật tư này
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  return selectable ? (
    <RadioGroup
      value={selectedSupplierId ?? ""}
      onValueChange={onSelectSupplier}
      className="contents"
    >
      {tableElement}
    </RadioGroup>
  ) : (
    tableElement
  )
}
