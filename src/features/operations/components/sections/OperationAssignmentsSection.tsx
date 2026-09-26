import { useMemo, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { CloseCircle, Magnifer, UsersGroupRounded } from "@solar-icons/react"
import { useDebounceCallback } from "usehooks-ts"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/shared/composites/Pagination"
import { Surface } from "@/components/shared/layouts/Surface"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { departmentQueryOptions } from "@/features/departments/api"
import { operationAssignmentsQueryOptions } from "@/features/operations/api/options"
import { positionOptionsQueryOptions } from "@/features/positions/api"
import { OperationAssignmentsDialog } from "@/features/operations/components/composites/OperationAssignmentsDialog"
import { buildOperationAssignmentColumns } from "@/features/operations/components/composites/OperationAssignmentsTableColumns"
import { buildSelectOptions, cn } from "@/lib/utils"
import type { SelectOption } from "@/lib/utils"
import type { PageSize } from "@/components/shared/composites/Pagination"

type OperationAssignmentsSectionProps = {
  operationId: string
  operationName: string
}

export function OperationAssignmentsSection({
  operationId,
  operationName,
}: OperationAssignmentsSectionProps) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<PageSize>(10)
  const [searchText, setSearchText] = useState("")
  const [q, setQ] = useState<string | undefined>(undefined)

  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    setQ(trimmed.length > 0 ? trimmed : undefined)
    setPage(1)
  }, 300)

  const [departmentId, setDepartmentId] = useState<string | undefined>()
  const [positionId, setPositionId] = useState<string | undefined>()

  const departmentsQuery = useQuery(departmentQueryOptions())
  // Chức vụ thuộc đúng một phòng ban, nên chỉ tải khi đã chọn phòng ban.
  const positionsQuery = useQuery({
    ...positionOptionsQueryOptions(departmentId ?? ""),
    enabled: Boolean(departmentId),
  })
  const departmentOptions: SelectOption[] = [
    { value: "all", label: "Tất cả phòng ban" },
    ...buildSelectOptions(departmentsQuery.data ?? []),
  ]
  const positionOptions: SelectOption[] = [
    { value: "all", label: "Tất cả chức vụ" },
    ...buildSelectOptions(positionsQuery.data ?? []),
  ]

  const assignmentsQuery = useQuery({
    ...operationAssignmentsQueryOptions({
      operationId,
      page,
      limit,
      q,
      departmentId,
      positionId,
    }),
    placeholderData: keepPreviousData,
  })
  const assignments = assignmentsQuery.data?.data ?? []
  const total = assignmentsQuery.data?.pagination.totalRecords ?? 0
  const hasSearch =
    q !== undefined || departmentId !== undefined || positionId !== undefined

  const columns = useMemo(
    () =>
      buildOperationAssignmentColumns({
        operationId,
        offset: (page - 1) * limit,
      }),
    [operationId, page, limit]
  )

  const table = useTable({
    data: assignments,
    columns,
    features: appTableFeatures,
  })

  const assignButton = (
    <PermissionGate permission="operations:update">
      <OperationAssignmentsDialog
        operationId={operationId}
        operationName={operationName}
        trigger={
          <Button size="sm" className="text-xs">
            <UsersGroupRounded className="size-4" />
            Phân công nhân sự
          </Button>
        }
      />
    </PermissionGate>
  )

  return (
    <Surface>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Nhân sự công đoạn ({total})
          </h2>
          <p className="text-sm text-muted-foreground">
            Những người được phân công vào công đoạn này
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Input
              aria-label="Tìm nhân sự"
              className="pr-9 text-xs"
              placeholder="Tìm theo mã hoặc tên..."
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value)
                handleSearch(event.target.value)
              }}
            />
            <Magnifer className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          {assignButton}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
        <Select
          items={departmentOptions}
          value={departmentId ?? "all"}
          onValueChange={(value) => {
            if (value === null) return
            setDepartmentId(value === "all" ? undefined : value)
            setPositionId(undefined)
            setPage(1)
          }}
        >
          <SelectTrigger
            aria-label="Lọc theo phòng ban"
            className="w-48 text-xs"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departmentOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={positionOptions}
          value={positionId ?? "all"}
          disabled={!departmentId}
          onValueChange={(value) => {
            if (value === null) return
            setPositionId(value === "all" ? undefined : value)
            setPage(1)
          }}
        >
          <SelectTrigger aria-label="Lọc theo chức vụ" className="w-48 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {positionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(departmentId || positionId) && (
          <Button
            type="button"
            variant="ghost"
            className="text-xs text-muted-foreground"
            onClick={() => {
              setDepartmentId(undefined)
              setPositionId(undefined)
              setPage(1)
            }}
          >
            <CloseCircle className="size-4" />
            Xóa lọc
          </Button>
        )}
      </div>

      {assignmentsQuery.isPending ? (
        <TableQueryLoading rows={3} />
      ) : assignmentsQuery.isError ? (
        <TableQueryError
          error={assignmentsQuery.error.message}
          onRetry={() => void assignmentsQuery.refetch()}
        />
      ) : assignments.length === 0 ? (
        <TableEmpty
          icon={UsersGroupRounded}
          title={
            hasSearch ? "Không tìm thấy nhân sự phù hợp" : "Chưa có nhân sự nào"
          }
          description={
            hasSearch
              ? undefined
              : "Phân công nhân sự làm việc ở công đoạn này."
          }
          action={hasSearch ? undefined : assignButton}
          className="border-0"
        />
      ) : (
        <>
          <div
            className={cn(
              "overflow-x-auto transition-opacity",
              assignmentsQuery.isFetching && "opacity-60"
            )}
          >
            <Table aria-label="Danh sách nhân sự của công đoạn">
              <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
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
                  <TableRow
                    key={row.id}
                    className="h-16 bg-card hover:bg-muted/25"
                  >
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
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination
            page={page}
            pageSize={limit}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(nextLimit) => {
              setLimit(nextLimit)
              setPage(1)
            }}
            disabled={assignmentsQuery.isFetching}
            className="border-t border-border px-4 py-3 sm:px-5"
          />
        </>
      )}
    </Surface>
  )
}
