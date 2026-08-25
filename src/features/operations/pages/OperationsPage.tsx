import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { RoutePermissionGate } from "@/components/shared/RoutePermissionGate"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { OperationsTable } from "@/features/operations/components/OperationsTable"
import { operationsQueryOptions } from "@/features/operations/api/options"

export function OperationsPage() {
  const operationsQuery = useQuery(operationsQueryOptions())

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Danh mục công đoạn"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Danh mục" },
          { label: "Danh mục công đoạn" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="min-h-[calc(100svh-13rem)]">
          <div className="flex items-center justify-end px-4 py-4 sm:px-5">
            <RoutePermissionGate route="/manage/operations/create">
              <Button asChild size="sm" className="text-xs">
                <Link to="/manage/operations/create">
                  <Plus className="size-4" />
                  Tạo công đoạn
                </Link>
              </Button>
            </RoutePermissionGate>
          </div>

          {operationsQuery.isPending ? (
            <TableQueryLoading rows={5} />
          ) : operationsQuery.isError ? (
            <TableQueryError
              error={operationsQuery.error.message}
              onRetry={() => void operationsQuery.refetch()}
            />
          ) : (
            <OperationsTable
              rows={operationsQuery.data}
              isPending={operationsQuery.isFetching}
            />
          )}
        </Surface>
      </div>
    </main>
  )
}
