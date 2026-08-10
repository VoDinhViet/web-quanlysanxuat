import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ClipboardList } from "lucide-react"

import { DataTable } from "@/components/shared/DataTable"
import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { TableEmptyState } from "@/components/shared/TableEmptyState"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { purchaseLedgerQueryOptions } from "@/features/purchase-ledger/api/options"
import { PurchaseLedgerLegend } from "@/features/purchase-ledger/components/PurchaseLedgerLegend"
import { purchaseLedgerColumns } from "@/features/purchase-ledger/components/PurchaseLedgerTableColumns"
import { PurchaseLedgerTableFilter } from "@/features/purchase-ledger/components/PurchaseLedgerTableFilter"
import { PurchaseLedgerWarning } from "@/lib/types/purchase-ledger.type"
import type { PurchaseLedgerRow } from "@/lib/types/purchase-ledger.type"

// Flags an urgent row the same way InventoryMaterialsPage flags a shortage row.
function purchaseLedgerRowClassName(
  row: PurchaseLedgerRow
): string | undefined {
  return row.warnings.includes(PurchaseLedgerWarning.URGENT)
    ? "border-l-2 border-l-destructive"
    : undefined
}

export function PurchaseLedgerPage() {
  // useSearch keys off the file-based route id. The loader prefetched the list, which resolves
  // via a plain useQuery so filter/pagination changes only update the table, not the whole
  // route. The filter reads/writes this same route search itself.
  const search = useSearch({ from: "/(authed)/manage_/purchase-ledger" })

  const purchaseLedgerQuery = useQuery({
    ...purchaseLedgerQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Danh mục mua hàng"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Danh mục mua hàng" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <PurchaseLedgerTableFilter />

          {purchaseLedgerQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : purchaseLedgerQuery.isError ? (
            <TableQueryError
              error={purchaseLedgerQuery.error.message}
              onRetry={() => void purchaseLedgerQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={purchaseLedgerQuery.data.data}
              columns={purchaseLedgerColumns}
              pagination={purchaseLedgerQuery.data.pagination}
              isPending={purchaseLedgerQuery.isFetching}
              rowClassName={purchaseLedgerRowClassName}
              emptyState={
                <TableEmptyState
                  icon={ClipboardList}
                  title="Chưa có nhu cầu mua hàng nào"
                  description="Nhu cầu mua hàng sẽ hiển thị tại đây sau khi đề xuất mua hàng được duyệt."
                />
              }
            />
          )}
        </Surface>

        <PurchaseLedgerLegend />
      </div>
    </main>
  )
}
