import { DateTime } from "luxon"
import { History } from "@solar-icons/react"

import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/shared/composites/Pagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { productionOrderLogActionLabels } from "@/lib/types/production-order.type"
import type { ProductionOrderLog } from "@/lib/types/production-order.type"
import type { Pagination as PaginationMeta } from "@/lib/types/pagination.type"
import { cn } from "@/lib/utils"

type ProductionOrderLogsCardProps = {
  logs: ProductionOrderLog[]
  pagination: PaginationMeta | undefined
  onPageChange: (page: number) => void
  isPending: boolean
  isFetching: boolean
}

// Real audit log (`production_order_logs`, đọc qua `GET /production-orders/:id/logs`) — mỗi
// hành động ghi (tạo LSX lúc duyệt PO, sửa số lượng sản xuất, duyệt LSX) tự ghi một dòng trong
// cùng transaction với hành động đó. `content` đã là câu tiếng Việt sẵn sàng hiển thị do backend
// dựng lúc ghi — không tự suy diễn/dựng câu ở đây. Phân trang cục bộ (state của trang, không phải
// search param của route) vì đây là phần phụ trên trang chi tiết vốn không có state phân trang
// riêng — không dùng chung route search param, `Pagination` chỉ nhận page/pageSize/total qua prop
// thuần, không tự patch route.
export function ProductionOrderLogsCard({
  logs,
  pagination,
  onPageChange,
  isPending,
  isFetching,
}: ProductionOrderLogsCardProps) {
  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold text-foreground sm:px-5">
        <History className="size-4 text-muted-foreground" />
        Lịch sử thay đổi
      </div>

      <div
        className={cn(
          "overflow-x-auto transition-opacity",
          isFetching && "pointer-events-none opacity-50"
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
              isPending ? (
                <div className="flex h-40 items-center justify-center">
                  <Spinner className="mx-auto size-6 text-muted-foreground" />
                </div>
              ) : (
                <TableEmpty colSpan={4} title="Chưa có dữ liệu lịch sử." />
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
                <TableCell>{log.performerBy?.fullName ?? "--"}</TableCell>
                <TableCell>
                  {productionOrderLogActionLabels[log.action]}
                </TableCell>
                <TableCell>{log.content}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <Pagination
          page={pagination.currentPage}
          pageSize={pagination.limit}
          total={pagination.totalRecords}
          onPageChange={onPageChange}
          className="border-t border-border/60 px-4 py-3 sm:px-5"
        />
      )}
    </section>
  )
}
