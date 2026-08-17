import { Fragment, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { PackageSearch } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { purchaseQuotationItemsColumns } from "@/features/purchase-quotations/components/detail/PurchaseQuotationItemsTableColumns"
import { PurchaseQuotationAllocationsTable } from "@/features/purchase-quotations/components/detail/PurchaseQuotationAllocationsTable"
import { PurchaseQuotationApprovalBar } from "@/features/purchase-quotations/components/detail/PurchaseQuotationApprovalBar"
import { PurchaseQuotationSupplierCompareTable } from "@/features/purchase-quotations/components/detail/PurchaseQuotationSupplierCompareTable"
import { useHasPermission } from "@/hooks/use-permissions"
import { PurchaseQuotationStatus } from "@/lib/types/purchase-quotation.type"
import type {
  PurchaseQuotationDetail,
  PurchaseQuotationSupplierSelection,
} from "@/lib/types/purchase-quotation.type"

type PurchaseQuotationDetailQuotesSectionProps = {
  detail: PurchaseQuotationDetail
}

// Read-only twin of CreateQuotationSuppliersSection.tsx (same outer+nested table shell, same
// left-ring accent marking which NCC block belongs to which vật tư) — with one live piece of
// state layered on top: while PENDING_APPROVAL and the viewer can approve, the nested tables
// grow a radio per supplier row (see PurchaseQuotationSupplierCompareTable), and this component
// owns the resulting "which NCC won which vật tư" selection until it's submitted via
// PurchaseQuotationApprovalBar.
export function PurchaseQuotationDetailQuotesSection({
  detail,
}: PurchaseQuotationDetailQuotesSectionProps) {
  const canApprove = useHasPermission("purchasing:approve")
  const selectable =
    detail.status === PurchaseQuotationStatus.PENDING_APPROVAL && canApprove

  const [selectedSuppliers, setSelectedSuppliers] =
    useState<PurchaseQuotationSupplierSelection>({})

  const table = useReactTable({
    data: detail.items,
    columns: purchaseQuotationItemsColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="not-first:border-t not-first:border-border">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Bảng so sánh báo giá
        </h2>
        <span className="text-xs font-medium text-muted-foreground">
          {selectable
            ? "Chọn 1 NCC thắng thầu cho mỗi vật tư bên dưới"
            : "Giá gần nhất, ngày mua chỉ để tham khảo"}
        </span>
      </div>

      <div className="overflow-hidden">
        {detail.items.length === 0 ? (
          <TableEmpty
            icon={PackageSearch}
            title="Chưa có vật tư nào"
            description="RFQ này chưa có vật tư nào để so sánh báo giá."
          />
        ) : (
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
              {table.getRowModel().rows.map((row) => (
                <Fragment key={row.original.id}>
                  <TableRow className="h-14 bg-card hover:bg-muted/25">
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

                  {/* Same inset-shadow left accent as CreateQuotationSuppliersSection.tsx — see
                      that file's comment for why it's a shadow, not border-l, and why it's set on
                      the <td> rather than the <tr>. Two nested tables now stack here — one vật tư
                      can merge several dòng ĐXMH (allocations), each still quoted as a single NCC
                      block. */}
                  <TableRow className="bg-card hover:bg-card">
                    <TableCell
                      colSpan={row.getVisibleCells().length}
                      className="space-y-2 p-0 pb-3 shadow-[inset_3px_0_0_0_var(--color-primary)]"
                    >
                      <p className="px-4 pt-3 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Nguồn ĐXMH
                      </p>
                      <PurchaseQuotationAllocationsTable item={row.original} />
                      <p className="px-4 pt-2 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Báo giá NCC
                      </p>
                      <PurchaseQuotationSupplierCompareTable
                        item={row.original}
                        selectable={selectable}
                        selectedSupplierId={selectedSuppliers[row.original.id]}
                        onSelectSupplier={(quotationItemSupplierId) =>
                          setSelectedSuppliers((current) => ({
                            ...current,
                            [row.original.id]: quotationItemSupplierId,
                          }))
                        }
                        isApproved={
                          detail.status === PurchaseQuotationStatus.APPROVED
                        }
                      />
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {selectable && (
        <PurchaseQuotationApprovalBar
          detail={detail}
          selectedSuppliers={selectedSuppliers}
          totalItems={detail.items.length}
        />
      )}
    </div>
  )
}
