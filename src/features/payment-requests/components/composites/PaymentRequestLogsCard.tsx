import { DateTime } from "luxon"
import { History } from "lucide-react"
import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LocalPagination } from "@/components/shared/composites/LocalPagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { paymentRequestLogsQueryOptions } from "@/features/payment-requests/api/options/payment-request-logs.options"
import { paymentRequestLogActionLabels } from "@/lib/types/payment-request.type"
import { cn } from "@/lib/utils"

type PaymentRequestLogsCardProps = {
  paymentRequestId: string
}

const limitOptions = [10, 20, 50] as const
const logColumnCount = 4

// Sidebar card — "Lịch sử thay đổi". Tự sở hữu query + phân trang cục bộ (useState, không qua
// route search param — route này chưa dùng page/limit cho gì khác), cùng khuôn
// ProductionOrderLogsCard.tsx nhưng tự gọi query bên trong thay vì nhận qua props (chỉ 1 nơi
// dùng component này). `content` đã là câu tiếng Việt dựng sẵn ở backend — không tự suy diễn ở
// đây.
export function PaymentRequestLogsCard({
  paymentRequestId,
}: PaymentRequestLogsCardProps) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<(typeof limitOptions)[number]>(10)
  const logsQuery = useQuery({
    ...paymentRequestLogsQueryOptions(paymentRequestId, page, limit),
    placeholderData: keepPreviousData,
  })

  const logs = logsQuery.data?.data ?? []
  const pagination = logsQuery.data?.pagination

  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <History className="size-4 text-muted-foreground" />
        Lịch sử thay đổi
      </div>

      <div
        className={cn(
          "overflow-x-auto transition-opacity",
          logsQuery.isFetching && "pointer-events-none opacity-50"
        )}
      >
        <Table aria-label="Lịch sử thay đổi">
          <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
            <TableHead id="createdAt" isRowHeader>
              Thời gian
            </TableHead>
            <TableHead id="performer">Người thực hiện</TableHead>
            <TableHead id="action">Hành động</TableHead>
            <TableHead id="content">Nội dung</TableHead>
          </TableHeader>
          <TableBody
            renderEmptyState={() =>
              logsQuery.isPending ? (
                <div className="flex h-40 items-center justify-center">
                  <Spinner className="mx-auto size-6 text-muted-foreground" />
                </div>
              ) : logsQuery.isError ? (
                <div className="flex h-40 items-center justify-center text-center text-xs text-muted-foreground">
                  {logsQuery.error.message}
                </div>
              ) : (
                <TableEmpty
                  colSpan={logColumnCount}
                  title="Chưa có dữ liệu lịch sử."
                />
              )
            }
          >
            {logs.map((log) => (
              <TableRow
                key={log.id}
                id={log.id}
                className="h-14 bg-card hover:bg-muted/25"
              >
                <TableCell className="whitespace-nowrap tabular-nums">
                  {DateTime.fromISO(log.createdAt).toFormat("dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>{log.performerBy?.fullName ?? "Hệ thống"}</TableCell>
                <TableCell>
                  {paymentRequestLogActionLabels[log.action]}
                </TableCell>
                <TableCell>{log.content}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <LocalPagination
          pagination={pagination}
          limitOptions={limitOptions}
          onPageChange={setPage}
          onLimitChange={(nextLimit) => {
            setLimit(nextLimit as (typeof limitOptions)[number])
            setPage(1)
          }}
          disabled={logsQuery.isFetching}
          className="border-t border-border px-4 py-3 sm:px-5"
        />
      ) : null}
    </section>
  )
}
