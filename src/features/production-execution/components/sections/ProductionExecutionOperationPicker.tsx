import { useMemo, useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { CircleAlert, Inbox } from "lucide-react"
import { Layers, Settings, Sort } from "@solar-icons/react"
import type { ComponentType } from "react"

import { LinkButton } from "@/components/ui/button"
import { RadioGroup } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Surface } from "@/components/shared/layouts/Surface"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import {
  AllOperationsChip,
  OperationChip,
} from "@/features/production-execution/components/composites/ProductionExecutionOperationChip"
import { ALL_OPERATIONS } from "@/features/production-execution/schemas/production-execution-search.schema"
import { productionExecutionOperationsQueryOptions } from "@/features/production-execution/api/options"
import type { ProductionExecutionOperation } from "@/lib/types/production-job.type"

const chipsClassName = "flex flex-wrap gap-2"

type OperationSort = "default" | "name" | "jobCount"

const sortOptions = [
  { value: "default", label: "Thứ tự mặc định" },
  { value: "name", label: "Tên A → Z" },
  { value: "jobCount", label: "Nhiều job nhất" },
]

// `position` giữ số thứ tự gốc của API để "01, 02…" không nhảy khi đổi kiểu sắp xếp.
type PositionedOperation = {
  operation: ProductionExecutionOperation
  position: number
}

function sortOperations(
  operations: ProductionExecutionOperation[],
  sort: OperationSort
): PositionedOperation[] {
  const positioned = operations.map((operation, index) => ({
    operation,
    position: index + 1,
  }))
  if (sort === "name") {
    return positioned.sort((a, b) =>
      a.operation.name.localeCompare(b.operation.name, "vi")
    )
  }
  if (sort === "jobCount") {
    return positioned.sort(
      (a, b) => b.operation.jobCount - a.operation.jobCount
    )
  }
  return positioned
}

const skeletonKeys = Array.from({ length: 8 }, (_, index) => index)

// "CHỌN CÔNG ĐOẠN" — lưới thẻ radio. Cùng query key với ProductionExecutionPage.tsx (dùng để
// tự chọn công đoạn đầu tiên) — React Query dùng chung cache, không gọi API 2 lần.
export function ProductionExecutionOperationPicker() {
  const search = useSearch({
    from: "/(authed)/manage_/production-execution/",
  })
  const navigate = useNavigate({ from: "/manage/production-execution/" })

  const operationsQuery = useQuery(
    productionExecutionOperationsQueryOptions({
      q: search.q,
      status: search.status,
      clientId: search.clientId,
      dueDateFrom: search.dueDateFrom,
      dueDateTo: search.dueDateTo,
    })
  )

  const [sort, setSort] = useState<OperationSort>("default")
  const sortedOperations = useMemo(
    () => sortOperations(operationsQuery.data ?? [], sort),
    [operationsQuery.data, sort]
  )

  const handleChange = (operationId: string) => {
    void navigate({
      search: (prev) => ({ ...prev, operationId, page: 1 }),
    })
  }

  return (
    <Surface>
      <div className="flex flex-col gap-3 p-4 lg:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Layers className="size-4" />
            </span>
            <h2 className="text-sm font-semibold text-foreground">
              Công đoạn sản xuất
            </h2>
            {operationsQuery.data !== undefined && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
                {operationsQuery.data.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select
              items={sortOptions}
              value={sort}
              onValueChange={(value) => value !== null && setSort(value)}
            >
              <SelectTrigger aria-label="Sắp xếp công đoạn" className="text-xs">
                <Sort className="size-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <RoutePermissionGate route="/manage/settings/operations">
              <LinkButton
                to="/manage/settings/operations"
                search={{ page: 1, limit: 10 }}
                variant="outline"
                className="text-xs"
              >
                <Settings className="size-4" />
                Quản lý công đoạn
              </LinkButton>
            </RoutePermissionGate>
          </div>
        </div>

        {operationsQuery.isPending ? (
          <div className={chipsClassName}>
            {skeletonKeys.map((key) => (
              <Skeleton key={key} className="h-14 w-44 rounded-md" />
            ))}
          </div>
        ) : operationsQuery.isError ? (
          <PickerMessage
            icon={CircleAlert}
            message="Không tải được danh sách công đoạn."
          />
        ) : operationsQuery.data.length === 0 ? (
          <PickerMessage
            icon={Inbox}
            message="Không có công đoạn nào khớp bộ lọc, hoặc bạn chưa được phân công vào công đoạn nào."
          />
        ) : (
          <RadioGroup
            aria-label="Chọn công đoạn sản xuất"
            value={search.operationId ?? ""}
            onValueChange={handleChange}
            className={chipsClassName}
          >
            <AllOperationsChip
              value={ALL_OPERATIONS}
              operations={operationsQuery.data}
              isChecked={search.operationId === ALL_OPERATIONS}
            />
            {sortedOperations.map(({ operation, position }) => (
              <OperationChip
                key={operation.operationId}
                operation={operation}
                position={position}
                isChecked={operation.operationId === search.operationId}
              />
            ))}
          </RadioGroup>
        )}
      </div>
    </Surface>
  )
}

type PickerMessageProps = {
  icon: ComponentType<{ className?: string }>
  message: string
}

function PickerMessage({ icon: Icon, message }: PickerMessageProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
      <Icon className="size-4" />
      {message}
    </div>
  )
}
