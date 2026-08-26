import { useEffect } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Surface } from "@/components/shared/layout/Surface"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { ProductionExecutionJobsTable } from "@/features/production-execution/components/list/ProductionExecutionJobsTable"
import { ProductionExecutionJobsTableFilter } from "@/features/production-execution/components/list/ProductionExecutionJobsTableFilter"
import { ProductionExecutionLegend } from "@/features/production-execution/components/list/ProductionExecutionLegend"
import {
  productionJobsByOperationQueryOptions,
  productionOperationSummaryQueryOptions,
} from "@/features/production-execution/api/options"

export function ProductionExecutionPage() {
  const search = useSearch({
    from: "/(authed)/manage_/production-execution/",
  })
  const navigate = useNavigate({ from: "/manage/production-execution/" })
  const { operationId, limit, q, status, clientId, dueDateFrom, dueDateTo } =
    search

  // Chỉ để tự chọn công đoạn đầu tiên bên dưới — Select thật nằm trong
  // ProductionExecutionJobsTableFilter.tsx, tự gọi lại đúng query key này (React Query dùng chung
  // cache, không gọi API 2 lần).
  const summaryQuery = useQuery(
    productionOperationSummaryQueryOptions({
      q,
      status,
      clientId,
      dueDateFrom,
      dueDateTo,
    })
  )

  // Chưa chọn công đoạn nào (lần vào đầu, hoặc bộ lọc vừa đổi khiến công đoạn cũ biến mất) → tự
  // chọn công đoạn đầu tiên ngay khi danh sách về. `replace` để không tạo thêm 1 bước back vô nghĩa.
  useEffect(() => {
    if (summaryQuery.data === undefined) return
    const stillValid = summaryQuery.data.some(
      (operation) => operation.operationId === operationId
    )
    if (stillValid) return

    const firstOperationId = summaryQuery.data.at(0)?.operationId
    if (firstOperationId === undefined) return

    void navigate({
      search: (prev) => ({ ...prev, operationId: firstOperationId, page: 1 }),
      replace: true,
    })
  }, [summaryQuery.data, operationId, navigate])

  const jobsQuery = useQuery({
    ...productionJobsByOperationQueryOptions(search),
    enabled: Boolean(operationId),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-22rem)]">
        <ProductionExecutionJobsTableFilter />

        {!operationId ? (
          <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-muted-foreground">
            Chọn một công đoạn để xem danh sách công việc.
          </div>
        ) : jobsQuery.isPending ? (
          <TableQueryLoading rows={limit} />
        ) : jobsQuery.isError ? (
          <TableQueryError
            error={jobsQuery.error.message}
            onRetry={() => void jobsQuery.refetch()}
          />
        ) : (
          <ProductionExecutionJobsTable
            rows={jobsQuery.data.data}
            pagination={jobsQuery.data.pagination}
            isPending={jobsQuery.isFetching}
          />
        )}
      </Surface>

      <ProductionExecutionLegend />
    </div>
  )
}
