import { Link, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { ClipboardList, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TableEmptyState } from "@/components/shared/feedback/TableEmptyState"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { DataTable } from "@/components/shared/data/DataTable"
import { purchaseRequestColumns } from "@/features/purchase-requests/components/PurchaseRequestsTableColumns"
import { PurchaseRequestsTableFilter } from "@/features/purchase-requests/components/PurchaseRequestsTableFilter"
import { purchaseRequestsQueryOptions } from "@/features/purchase-requests/api/options"

export function PurchaseRequestsPage() {
  // useSearch keys off the file-based route id. The loader prefetched the
  // list, which resolves via a plain useQuery so filter/pagination changes
  // only update the table, not the whole route. The filter reads/writes this
  // same route search itself (its own useSearch/useNavigate) and fetches its
  // own reference options, rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/purchase-requests" })

  const purchaseRequestsQuery = useQuery({
    ...purchaseRequestsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

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
          <PurchaseRequestsTableFilter />

          {purchaseRequestsQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : purchaseRequestsQuery.isError ? (
            <TableQueryError
              error={purchaseRequestsQuery.error.message}
              onRetry={() => void purchaseRequestsQuery.refetch()}
            />
          ) : (
            <DataTable
              rows={purchaseRequestsQuery.data.data}
              columns={purchaseRequestColumns}
              pagination={purchaseRequestsQuery.data.pagination}
              isPending={purchaseRequestsQuery.isFetching}
              emptyState={
                <TableEmptyState
                  icon={ClipboardList}
                  title="Chưa có đề xuất mua hàng nào"
                  description="Đề xuất mua hàng sẽ hiển thị tại đây khi được tạo."
                  action={
                    <PermissionGate permission="purchase-requests:create">
                      <Button asChild size="sm" className="text-xs">
                        <Link to="/manage/purchase-requests/create">
                          <Plus className="size-4" />
                          Tạo đề xuất mua hàng (Manual)
                        </Link>
                      </Button>
                    </PermissionGate>
                  }
                />
              }
            />
          )}
        </Surface>
      </div>
    </main>
  )
}
