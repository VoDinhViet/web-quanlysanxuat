import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Surface } from "@/components/shared/layout/Surface"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { CreateOperationDialog } from "@/features/operations/components/CreateOperationDialog"
import { OperationsTable } from "@/features/operations/components/OperationsTable"
import { operationsQueryOptions } from "@/features/operations/api/options"

export function OperationsPage() {
  const search = useSearch({ from: "/(authed)/manage_/operations/" })
  const navigate = useNavigate({ from: "/manage/operations/" })

  const [q, setQ] = useState(search.q ?? "")

  // `replace` so every debounced keystroke doesn't bury the pre-search page under history entries.
  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    void navigate({
      search: (prev) => ({
        ...prev,
        q: trimmed.length > 0 ? trimmed : undefined,
      }),
      replace: true,
    })
  }, 300)

  const operationsQuery = useQuery(operationsQueryOptions(search))

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <div className="relative w-full max-w-xs">
            <Input
              className="pr-9 text-xs placeholder:text-muted-foreground/75"
              placeholder="Tìm theo tên công đoạn..."
              value={q}
              onChange={(event) => {
                setQ(event.target.value)
                handleSearch(event.target.value)
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  handleSearch.flush()
                }
              }}
            />
            <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <PermissionGate permission="operations:create">
            <CreateOperationDialog
              trigger={
                <Button size="sm" className="text-xs">
                  <Plus className="size-4" />
                  Tạo công đoạn
                </Button>
              }
            />
          </PermissionGate>
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
  )
}
