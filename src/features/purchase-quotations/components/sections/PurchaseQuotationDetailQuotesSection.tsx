import { Fragment, useState } from "react"
import { flexRender, useTable } from "@tanstack/react-table"
import { useSuspenseQuery } from "@tanstack/react-query"
import { appTableFeatures } from "@/lib/table-features"
import { PackageSearch } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { purchaseQuotationComparisonQueryOptions } from "@/features/purchase-quotations/api/options"
import { purchaseQuotationItemsColumns } from "@/features/purchase-quotations/components/composites/PurchaseQuotationItemsTableColumns"
import { PurchaseQuotationAllocationsTable } from "@/features/purchase-quotations/components/composites/PurchaseQuotationAllocationsTable"
import { PurchaseQuotationApprovalBar } from "@/features/purchase-quotations/components/layouts/PurchaseQuotationApprovalBar"
import { PurchaseQuotationSupplierCompareTable } from "@/features/purchase-quotations/components/composites/PurchaseQuotationSupplierCompareTable"
import { useHasPermission } from "@/hooks/use-permissions"
import { PurchaseQuotationStatus } from "@/lib/types/purchase-quotation.type"
import type {
  PurchaseQuotationDetail,
  PurchaseQuotationSupplierSelection,
} from "@/lib/types/purchase-quotation.type"

type PurchaseQuotationDetailQuotesSectionProps = {
  purchaseQuotation: PurchaseQuotationDetail
}

export function PurchaseQuotationDetailQuotesSection({
  purchaseQuotation,
}: PurchaseQuotationDetailQuotesSectionProps) {
  const canApprove = useHasPermission("purchasing:approve")
  const selectable =
    purchaseQuotation.status === PurchaseQuotationStatus.PENDING_APPROVAL &&
    canApprove

  const [selectedSuppliers, setSelectedSuppliers] =
    useState<PurchaseQuotationSupplierSelection>({})

  const { data: items = [] } = useSuspenseQuery(
    purchaseQuotationComparisonQueryOptions(purchaseQuotation.id)
  )

  const table = useTable({
    data: items,
    columns: purchaseQuotationItemsColumns,
    features: appTableFeatures,
  })

  return (
    <div className="not-first:border-t not-first:border-border">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <h2 className="font-heading text-base font-medium text-foreground">
          Bảng so sánh báo giá
        </h2>
        <span className="text-xs font-medium text-muted-foreground">
          {selectable
            ? "Chọn 1 NCC thắng thầu cho mỗi vật tư bên dưới"
            : "Giá gần nhất, ngày mua chỉ để tham khảo"}
        </span>
      </div>

      <div className="overflow-hidden">
        {items.length === 0 ? (
          <TableEmpty
            icon={PackageSearch}
            title="Chưa có vật tư nào"
            description="RFQ này chưa có vật tư nào để so sánh báo giá."
          />
        ) : (
          <Table aria-label="Bảng so sánh báo giá">
            <TableHeader className="[&>tr]:h-11 [&>tr]:hover:bg-muted/45">
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
              {table.getRowModel().rows.map((row) => (
                <Fragment key={row.original.id}>
                  {/* Dòng tóm tắt vật tư */}
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

                  {/* Dòng chi tiết: Nguồn ĐXMH ở trên, Báo giá NCC ở dưới (đúng vị trí cũ, phẳng và đồng bộ) */}
                  <TableRow
                    id={`${row.original.id}-detail`}
                    className="bg-card hover:bg-card"
                  >
                    <TableCell
                      colSpan={row.getVisibleCells().length}
                      className="space-y-2 p-0 pb-4 shadow-[inset_3px_0_0_0_var(--color-primary)]"
                    >
                      {/* 1. Nguồn ĐXMH (vị trí cũ) */}
                      <p className="px-4 pt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Nguồn ĐXMH
                      </p>
                      <PurchaseQuotationAllocationsTable item={row.original} />

                      {/* 2. Báo giá NCC (vị trí cũ, 5 cột 2 tầng thông tin không tràn ngang) */}
                      <p className="px-4 pt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
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
                          purchaseQuotation.status ===
                          PurchaseQuotationStatus.APPROVED
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
          purchaseQuotation={purchaseQuotation}
          selectedSuppliers={selectedSuppliers}
          totalItems={items.length}
        />
      )}
    </div>
  )
}
