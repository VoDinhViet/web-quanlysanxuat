import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { supplierReturnsQueryOptions } from "@/features/supplier-returns/api/options"
import { SupplierReturnsTable } from "@/features/supplier-returns/components/SupplierReturnsTable"
import { SupplierReturnsTableFilter } from "@/features/supplier-returns/components/SupplierReturnsTableFilter"

export function SupplierReturnsPage() {
  // useSearch keys off the file-based route id. The loader prefetched the list, which resolves
  // via a plain useQuery so filter/pagination changes only update the table, not the whole route.
  // The filter reads/writes this same route search itself.
  const search = useSearch({ from: "/(authed)/manage_/supplier-returns" })

  const supplierReturnsQuery = useQuery({
    ...supplierReturnsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Trả NCC"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Trả NCC" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <SupplierReturnsTableFilter />

          {supplierReturnsQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : supplierReturnsQuery.isError ? (
            <TableQueryError
              error={supplierReturnsQuery.error.message}
              onRetry={() => void supplierReturnsQuery.refetch()}
            />
          ) : (
            <SupplierReturnsTable
              rows={supplierReturnsQuery.data.data}
              pagination={supplierReturnsQuery.data.pagination}
              isPending={supplierReturnsQuery.isFetching}
            />
          )}
        </Surface>
      </div>
    </main>
  )
}
