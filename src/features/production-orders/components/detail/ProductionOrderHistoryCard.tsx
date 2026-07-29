import { DateTime } from "luxon"
import historyBold from "@iconify-icons/solar/history-bold"
import { Icon } from "@iconify/react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmptyRow } from "@/components/shared/TableEmptyRow"
import type { OrderDetail } from "@/lib/types/order.type"

type ProductionOrderHistoryCardProps = {
  order: OrderDetail
}

// Backend không có bảng audit log cho bất kỳ entity nào (đã xác nhận khi khảo sát) — mốc thật
// duy nhất suy ra được là lúc kế hoạch LSX được khởi tạo, đúng lúc đơn hàng được duyệt
// (`PATCH /orders/:orderId/approve` ghi sẵn các dòng production_orders PENDING, xem
// docs/features/production.md). Không bịa thêm dòng "Cập nhật số lượng" hay "Duyệt LSX" vì
// không có field issuedAt/issuedBy nào lộ ra ở endpoint trang này đang dùng.
export function ProductionOrderHistoryCard({
  order,
}: ProductionOrderHistoryCardProps) {
  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold text-foreground sm:px-5">
        <Icon icon={historyBold} className="size-4 text-muted-foreground" />
        Lịch sử thay đổi
      </div>

      <div className="overflow-x-auto">
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
            {order.approvedAt ? (
              <TableRow className="h-14 bg-card hover:bg-muted/25">
                <TableCell className="whitespace-nowrap tabular-nums">
                  {DateTime.fromISO(order.approvedAt).toFormat(
                    "dd/MM/yyyy HH:mm"
                  )}
                </TableCell>
                <TableCell>{order.approver?.username ?? "Hệ thống"}</TableCell>
                <TableCell>Duyệt đơn hàng &amp; tạo kế hoạch LSX</TableCell>
                <TableCell>
                  Tạo kế hoạch sản xuất từ đơn hàng {order.code} sau khi đơn
                  hàng được duyệt.
                </TableCell>
              </TableRow>
            ) : (
              <TableEmptyRow colSpan={4} message="Chưa có dữ liệu lịch sử." />
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
