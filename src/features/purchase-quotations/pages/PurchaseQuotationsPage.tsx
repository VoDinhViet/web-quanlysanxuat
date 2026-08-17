import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { FileText } from "lucide-react"

import { DataTable } from "@/components/shared/data/DataTable"
import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { TableEmptyState } from "@/components/shared/feedback/TableEmptyState"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { purchaseQuotationsQueryOptions } from "@/features/purchase-quotations/api/options"
import { PurchaseQuotationLegend } from "@/features/purchase-quotations/components/PurchaseQuotationLegend"
import { purchaseQuotationsColumns } from "@/features/purchase-quotations/components/PurchaseQuotationsTableColumns"
import { PurchaseQuotationsTableFilter } from "@/features/purchase-quotations/components/PurchaseQuotationsTableFilter"

export function PurchaseQuotationsPage() {
  // useSearch keys off the file-based route id. The loader prefetched the list, which resolves
  // via a plain useQuery so filter/pagination changes only update the table, not the whole route.
  // The filter reads/writes this same route search itself.
  const search = useSearch({ from: "/(authed)/manage_/purchase-quotations" })

  const purchaseQuotationsQuery = useQuery({
    ...purchaseQuotationsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Báo giá NCC"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Báo giá NCC" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <PurchaseQuotationsTableFilter />

          {purchaseQuotationsQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : purchaseQuotationsQuery.isError ? (
            <TableQueryError
              error={purchaseQuotationsQuery.error.message}
              onRetry={() => void purchaseQuotationsQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={purchaseQuotationsQuery.data.data}
              columns={purchaseQuotationsColumns}
              pagination={purchaseQuotationsQuery.data.pagination}
              isPending={purchaseQuotationsQuery.isFetching}
              emptyState={
                <TableEmptyState
                  icon={FileText}
                  title="Chưa có báo giá nào"
                  description="Báo giá NCC sẽ hiển thị tại đây sau khi được tạo từ đề xuất mua hàng đã duyệt."
                />
              }
            />
          )}
        </Surface>

        <PurchaseQuotationLegend />
      </div>
    </main>
  )
}
