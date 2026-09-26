import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { AddCircle, CloseCircle, Magnifer } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { CreateOperationDialog } from "@/features/operations/components/composites/CreateOperationDialog"
import { OperationsTable } from "@/features/operations/components/sections/OperationsTable"
import { operationsQueryOptions } from "@/features/operations/api/options"
import { operationStatusLabels } from "@/lib/types/operation.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { OperationStatus } from "@/lib/types/operation.type"

const statusFilterOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  ...buildOptionsFromLabels(operationStatusLabels),
]

export function OperationsPage() {
  const search = useSearch({ from: "/(authed)/manage_/settings/operations" })
  const navigate = useNavigate({ from: "/manage/settings/operations" })

  const [q, setQ] = useState(search.q ?? "")

  // `replace` so every debounced keystroke doesn't bury the pre-search page under history entries.
  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    void navigate({
      search: (prev) => ({
        ...prev,
        q: trimmed.length > 0 ? trimmed : undefined,
        page: 1,
      }),
      replace: true,
    })
  }, 300)

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as OperationStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const hasFilters = Boolean(search.q ?? search.status)

  const resetFilters = () => {
    // Cancel first: a debounced call still in flight would re-apply the term the user just cleared.
    handleSearch.cancel()
    setQ("")
    void navigate({ search: { page: 1, limit: search.limit }, replace: true })
  }

  const operationsQuery = useQuery({
    ...operationsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex min-w-0 flex-col">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
        <div className="space-y-1">
          <h2 className="font-heading text-lg text-foreground">
            Công đoạn sản xuất
          </h2>
          <p className="text-sm text-muted-foreground">
            Các bước sản xuất dùng khi lập BOM và chạy lệnh sản xuất.
          </p>
        </div>

        <PermissionGate permission="operations:create">
          <CreateOperationDialog
            trigger={
              <Button className="shrink-0 text-xs">
                <AddCircle className="size-4" />
                Tạo công đoạn
              </Button>
            }
          />
        </PermissionGate>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
        <div className="relative w-full sm:w-64">
          <Input
            aria-label="Tìm công đoạn"
            className="pr-9 text-xs placeholder:text-muted-foreground/75"
            placeholder="Tìm theo tên công đoạn..."
            value={q}
            onChange={(event) => {
              setQ(event.target.value)
              handleSearch(event.target.value)
            }}
          />
          <Magnifer className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <Select
          items={statusFilterOptions}
          value={search.status ?? "all"}
          onValueChange={(value) => value !== null && handleStatusChange(value)}
        >
          <SelectTrigger
            aria-label="Lọc theo trạng thái"
            className="w-44 text-xs"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            className="text-xs text-muted-foreground"
            onClick={resetFilters}
          >
            <CloseCircle className="size-4" />
            Xóa lọc
          </Button>
        )}
      </div>

      <div>
        {operationsQuery.isPending ? (
          <TableQueryLoading rows={5} />
        ) : operationsQuery.isError ? (
          <TableQueryError
            error={operationsQuery.error.message}
            onRetry={() => void operationsQuery.refetch()}
          />
        ) : (
          <OperationsTable
            rows={operationsQuery.data.data}
            pagination={operationsQuery.data.pagination}
            isPending={operationsQuery.isFetching}
          />
        )}
      </div>
    </div>
  )
}
