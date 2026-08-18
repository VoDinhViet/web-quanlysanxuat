import { Delivery } from "@solar-icons/react"
import { DateTime } from "luxon"
import { Truck } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { OrderDetailSectionCard } from "@/features/orders/components/detail/OrderDetailSectionCard"
import { buildMockDeliveryHistory } from "@/features/orders/mock/order-detail.mock"
import { vndFormatter } from "@/lib/currency"
import type { OrderDetail, OrderItem } from "@/lib/types/order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type OrderDetailDeliveryHistoryCardProps = {
  order: OrderDetail
  items: OrderItem[]
}

export function OrderDetailDeliveryHistoryCard({
  order,
  items,
}: OrderDetailDeliveryHistoryCardProps) {
  const rows = buildMockDeliveryHistory(order, items)

  return (
    <OrderDetailSectionCard icon={Delivery} title="Lịch sử giao hàng" isMock>
      {rows.length === 0 ? (
        <TableEmpty
          icon={Truck}
          title="Chưa có lượt giao hàng nào"
          description="Lượt giao hàng sẽ hiện ở đây khi đơn hàng bắt đầu được giao."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="h-11 hover:bg-muted/45">
                <TableHead>Mã DO</TableHead>
                <TableHead>Ngày giao</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead className="text-right">Giá trị</TableHead>
                <TableHead>Phương tiện</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.code} className="bg-card hover:bg-muted/25">
                  <TableCell className="font-mono text-xs text-foreground">
                    {row.code}
                  </TableCell>
                  <TableCell>
                    {DateTime.fromISO(row.deliveredAt).toFormat("dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {quantityFormatter.format(row.quantity)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {vndFormatter.format(row.valueVnd)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.vehicle}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </OrderDetailSectionCard>
  )
}
