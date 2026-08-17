import { DateTime } from "luxon"
import { History } from "@solar-icons/react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmptyRow } from "@/components/shared/feedback/TableEmptyRow"
import { productionOrderLogActionLabels } from "@/lib/types/production-order.type"
import type { ProductionOrderLog } from "@/lib/types/production-order.type"
import type { Pagination } from "@/lib/types/pagination.type"
import { cn } from "@/lib/utils"

type ProductionOrderLogsCardProps = {
  logs: ProductionOrderLog[]
  pagination: Pagination | undefined
  page: number
  onPageChange: (page: number) => void
  isPending: boolean
  isFetching: boolean
}

// Real audit log (`production_order_logs`, đọc qua `GET /production-orders/:id/logs`) — mỗi
// hành động ghi (tạo LSX lúc duyệt PO, sửa số lượng sản xuất, duyệt LSX) tự ghi một dòng trong
// cùng transaction với hành động đó. `content` đã là câu tiếng Việt sẵn sàng hiển thị do backend
// dựng lúc ghi — không tự suy diễn/dựng câu ở đây. Phân trang cục bộ (state của trang, không phải
// search param của route) vì đây là phần phụ trên trang chi tiết vốn không có state phân trang
// riêng — không dùng chung <TablePagination/>, component đó gắn chặt vào search param của route
// hiện tại.
export function ProductionOrderLogsCard({
  logs,
  pagination,
  page,
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
        <Table>
          <TableHeader>
            <TableRow className="h-12 hover:bg-muted/45">
              <TableHead>Thời gian</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Nội dung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="h-40 text-center">
                  <Spinner className="mx-auto size-6 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableEmptyRow colSpan={4} message="Chưa có dữ liệu lịch sử." />
            ) : (
              logs.map((log) => (
                <TableRow
                  key={log.id}
                  className="h-14 bg-card hover:bg-muted/25"
                >
                  <TableCell className="whitespace-nowrap tabular-nums">
                    {DateTime.fromISO(log.createdAt).toFormat(
                      "dd/MM/yyyy HH:mm"
                    )}
                  </TableCell>
                  <TableCell>{log.performer?.username ?? "Hệ thống"}</TableCell>
                  <TableCell>
                    {productionOrderLogActionLabels[log.action]}
                  </TableCell>
                  <TableCell>{log.content}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-xs font-medium text-muted-foreground sm:px-5">
          <p>
            Trang {pagination.currentPage} / {pagination.totalPages} — tổng số{" "}
            {pagination.totalRecords} bản ghi
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Trang trước"
              disabled={pagination.previousPage === null}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Trang sau"
              disabled={pagination.nextPage === null}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
