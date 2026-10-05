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
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import { purchaseQuotationAllocationsColumns } from "@/features/purchase-quotations/components/composites/PurchaseQuotationAllocationsColumns"
import { cn } from "@/lib/utils"
import type {
  PurchaseQuotationApprovedAllocations,
  PurchaseQuotationItemDetail,
} from "@/lib/types/purchase-quotation.type"

type PurchaseQuotationAllocationsTableProps = {
  item: PurchaseQuotationItemDetail
  // Chỉ truyền khi đang chờ duyệt và người xem duyệt được: thêm 2 cột "SL duyệt"/"Lý do" để duyệt
  // một phần — NCC chỉ đáp ứng một phần thì giảm SL, phần còn lại quay về sổ cái để báo giá lại.
  approval?: {
    approved: PurchaseQuotationApprovedAllocations
    onChange: (
      allocationId: string,
      next: { quantity: number | undefined; reason: string }
    ) => void
  }
}

// Read-only twin of PurchaseQuotationSupplierCompareTable.tsx's shell (same compact h-8 header,
// border-b border-primary/15 cells) — the two stack under the same outer row in
// PurchaseQuotationDetailQuotesSection.tsx, one listing the vật tư's NCC quotes, this one listing
// the ĐXMH lines merged into it.
export function PurchaseQuotationAllocationsTable({
  item,
  approval,
}: PurchaseQuotationAllocationsTableProps) {
  const table = useTable({
    data: item.allocations,
    columns: purchaseQuotationAllocationsColumns,
    features: appTableFeatures,
  })

  return (
    <Table aria-label="Danh sách dòng ĐXMH">
      <TableHeader className="bg-transparent [&>tr]:h-8 [&>tr]:bg-transparent [&>tr]:hover:bg-transparent">
        <TableRow>
          {table.getFlatHeaders().map((header) => (
            <TableHead
              key={header.id}
              className={cn(
                "border-b border-primary/15",
                header.column.columnDef.meta?.headerClassName
              )}
            >
              {!header.isPlaceholder &&
                flexRender(header.column.columnDef.header, header.getContext())}
            </TableHead>
          ))}
          {approval && (
            <>
              <TableHead className="w-32 border-b border-primary/15 text-right text-[10px]">
                SL duyệt
              </TableHead>
              <TableHead className="min-w-48 border-b border-primary/15 text-[10px]">
                Lý do duyệt thiếu
              </TableHead>
            </>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={
                purchaseQuotationAllocationsColumns.length + (approval ? 2 : 0)
              }
            >
              {/* Nested sub-row hint, indented under the outer item row — same "too small-scale
                  for TableEmpty" treatment as QuotationItemsListColumns.tsx /
                  PurchaseQuotationSupplierCompareTable.tsx, this table's twin stacked right
                  below it. */}
              <div className="flex h-11 items-center pl-10">
                <span className="text-xs text-muted-foreground">
                  Chưa có dòng ĐXMH nào cho vật tư này
                </span>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="h-11 bg-transparent hover:bg-transparent"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    "border-b border-primary/15",
                    cell.column.columnDef.meta?.cellClassName
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
              {approval && (
                <ApprovalCells allocation={row.original} approval={approval} />
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

type ApprovalCellsProps = {
  allocation: PurchaseQuotationItemDetail["allocations"][number]
  approval: NonNullable<PurchaseQuotationAllocationsTableProps["approval"]>
}

function ApprovalCells({ allocation, approval }: ApprovalCellsProps) {
  const entry = approval.approved[allocation.id]
  const quantity = entry ? entry.quantity : allocation.quantity
  const reason = entry?.reason ?? ""
  const isReduced = quantity !== undefined && quantity < allocation.quantity

  return (
    <>
      <TableCell className="border-b border-primary/15">
        <NumericCellInput
          value={quantity}
          min={0.001}
          max={allocation.quantity}
          className={cn(
            "text-right tabular-nums",
            isReduced && "border-warning/70 text-warning"
          )}
          onValueChange={(next) =>
            approval.onChange(allocation.id, { quantity: next, reason })
          }
        />
      </TableCell>
      <TableCell className="border-b border-primary/15">
        {isReduced ? (
          <TableTextCellInput
            value={reason}
            placeholder="Nhập lý do (bắt buộc)"
            className={cn(
              !reason.trim() &&
                "border-warning/60 focus-visible:ring-warning/30"
            )}
            onValueChange={(next) =>
              approval.onChange(allocation.id, { quantity, reason: next })
            }
          />
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
    </>
  )
}
