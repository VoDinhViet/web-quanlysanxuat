import { useNavigate, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { PurchaseRequestsTable } from "@/features/purchase-requests/components/PurchaseRequestsTable"
import { PurchaseRequestsTableFilter } from "@/features/purchase-requests/components/PurchaseRequestsTableFilter"
import { purchaseRequestsQueryOptions } from "@/features/purchase-requests/api/options"
import type { PurchaseRequestsSearchSchema } from "@/features/purchase-requests/schemas/purchase-requests-search.schema"

export function PurchaseRequestsPage() {
  // useSearch keys off the file-based route id; useNavigate's `from` keys off the
  // resolved URL path instead — the two intentionally differ. The loader prefetched
  // the list, which resolves via a plain useQuery so filter/pagination changes only
  // update the table, not the whole route.
  const search = useSearch({ from: "/(authed)/manage_/purchase-requests" })
  const navigate = useNavigate({ from: "/manage/purchase-requests" })

  const purchaseRequestsQuery = useQuery({
    ...purchaseRequestsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  // `replace` is for the search box: it commits on every debounced keystroke, and
  // pushing each one would bury the pre-search page under a dozen history entries.
  // Discrete filters (the selects, the date pickers) stay on push so Back undoes
  // them one by one.
  const handleFilterChange = (
    patch: Partial<PurchaseRequestsSearchSchema>,
    options?: { replace?: boolean }
  ) => {
    void navigate({
      search: (prev) => ({ ...prev, ...patch, page: 1 }),
      replace: options?.replace,
    })
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Quản lý mua hàng"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Đề xuất mua hàng" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <PurchaseRequestsTableFilter
            search={search}
            onFilterChange={handleFilterChange}
          />

          {purchaseRequestsQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : purchaseRequestsQuery.isError ? (
            <TableQueryError
              error={purchaseRequestsQuery.error.message}
              onRetry={() => void purchaseRequestsQuery.refetch()}
            />
          ) : (
            <PurchaseRequestsTable
              rows={purchaseRequestsQuery.data.data}
              pagination={purchaseRequestsQuery.data.pagination}
              isPending={purchaseRequestsQuery.isFetching}
            />
          )}
        </Surface>
      </div>
    </main>
  )
}
