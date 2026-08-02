import { Card2 } from "@solar-icons/react"
import { DateTime } from "luxon"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderDetailSectionCard } from "@/features/orders/components/detail/OrderDetailSectionCard"
import { buildMockPaymentHistory } from "@/features/orders/mock/order-detail.mock"
import { vndFormatter } from "@/lib/currency"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailPaymentHistoryCardProps = {
  order: OrderDetail
}

export function OrderDetailPaymentHistoryCard({
  order,
}: OrderDetailPaymentHistoryCardProps) {
  const rows = buildMockPaymentHistory(order)

  return (
    <OrderDetailSectionCard icon={Card2} title="Lịch sử thanh toán" isMock>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Chưa có giao dịch thanh toán nào.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="h-11 hover:bg-muted/45">
                <TableHead>Ngày thanh toán</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead>Người thu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.paidAt}
                  className="bg-card hover:bg-muted/25"
                >
                  <TableCell>
                    {DateTime.fromISO(row.paidAt).toFormat("dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {vndFormatter.format(row.amountVnd)}
                  </TableCell>
                  <TableCell>{row.method}</TableCell>
                  <TableCell>{row.collectedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </OrderDetailSectionCard>
  )
}
