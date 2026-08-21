import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { materialIssuesQueryOptions } from "@/features/material-issues/api/options"
import { MaterialIssuesTable } from "@/features/material-issues/components/MaterialIssuesTable"
import { MaterialIssuesTableFilter } from "@/features/material-issues/components/MaterialIssuesTableFilter"
import { MaterialIssuesLegend } from "@/features/material-issues/components/MaterialIssuesLegend"

export function MaterialIssuesPage() {
  const search = useSearch({ from: "/(authed)/manage_/material-issues" })

  const materialIssuesQuery = useQuery({
    ...materialIssuesQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Danh sách lãnh vật tư"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý sản xuất" },
          { label: "Lãnh vật tư" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <MaterialIssuesTableFilter />

          {materialIssuesQuery.isPending ? (
            <TableQueryLoading rows={search.limit} />
          ) : materialIssuesQuery.isError ? (
            <TableQueryError
              error={materialIssuesQuery.error.message}
              onRetry={() => void materialIssuesQuery.refetch()}
            />
          ) : (
            <MaterialIssuesTable
              rows={materialIssuesQuery.data.data}
              pagination={materialIssuesQuery.data.pagination}
              isPending={materialIssuesQuery.isFetching}
            />
          )}
        </Surface>

        <MaterialIssuesLegend />
      </div>
    </main>
  )
}
