import { Card2 } from "@solar-icons/react"
import { DateTime } from "luxon"
import { CreditCard } from "lucide-react"

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
import { currencyFormatter } from "@/lib/currency"
import type { OrderDetail, OrderPayment } from "@/lib/types/order.type"

type OrderDetailPaymentsCardProps = {
  order: OrderDetail
  payments: OrderPayment[]
}

// `amount` is recorded in the order's own currency (matching `total`/`paidAmount`, which
// `paymentStatus` compares against) — not VND, so this uses currencyFormatter + order.currency,
// same idiom as OrderDetailPaymentSummary. Named to match the backing resource
// (OrderPayment/getOrderPayments), not "history" — same idiom as OrderDetailItemsCard.
export function OrderDetailPaymentsCard({
  order,
  payments,
}: OrderDetailPaymentsCardProps) {
  return (
    <OrderDetailSectionCard icon={Card2} title="Lịch sử thanh toán">
      {payments.length === 0 ? (
        <TableEmpty
          icon={CreditCard}
          title="Chưa có giao dịch thanh toán nào"
          description="Giao dịch thanh toán sẽ hiện ở đây khi được ghi nhận."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="h-11 hover:bg-muted/45">
                <TableHead>Ngày thanh toán</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Người thu</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="bg-card hover:bg-muted/25"
                >
                  <TableCell>
                    {DateTime.fromISO(payment.paidAt).toFormat("dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {currencyFormatter.format(payment.amount)} {order.currency}
                  </TableCell>
                  <TableCell>
                    {payment.creatorBy?.fullName ?? "Hệ thống"}
                  </TableCell>
                  <TableCell>{payment.note ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </OrderDetailSectionCard>
  )
}
