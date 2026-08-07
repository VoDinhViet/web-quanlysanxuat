import { Link } from "@tanstack/react-router"
import { Box } from "@solar-icons/react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderDetailPaymentSummary } from "@/features/orders/components/detail/OrderDetailPaymentSummary"
import { OrderDetailSectionCard } from "@/features/orders/components/detail/OrderDetailSectionCard"
import {
  buildMockDeliveryProgress,
  deriveMockItemDelivered,
} from "@/features/orders/mock/order-detail.mock"
import { currencyFormatter } from "@/lib/currency"
import { orderItemStatusLabels, OrderItemStatus } from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type OrderDetailItemsCardProps = {
  order: OrderDetail
}

// "Đã giao"/"Còn lại" split each line by the order's own mock delivery
// percent (see order-detail-mock.ts) — there's no per-item delivery log, so
// every line is assumed to ship at the same pace as the order overall.
export function OrderDetailItemsCard({ order }: OrderDetailItemsCardProps) {
  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )
  const progress = buildMockDeliveryProgress(order)

  return (
    <OrderDetailSectionCard
      icon={Box}
      title={`Danh sách sản phẩm (${order.items.length})`}
    >
      {order.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Đơn hàng chưa có sản phẩm nào.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="overflow-x-auto rounded-md border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="h-12 hover:bg-muted/45">
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>ĐVT</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-right">CK (%)</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                  <MockColumnHead label="Đã giao" />
                  <MockColumnHead label="Còn lại" />
                  <TableHead className="text-center">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, index) => {
                  const { delivered, remaining } = deriveMockItemDelivered(
                    item.quantity,
                    progress.deliveredPercent
                  )

                  return (
                    <TableRow
                      key={item.id}
                      className="h-14 bg-card hover:bg-muted/25"
                    >
                      <TableCell className="text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <Link
                            to="/manage/products/$productId"
                            params={{ productId: item.product.id }}
                            search={{ tab: "info" }}
                            className="block truncate font-medium text-foreground hover:text-primary hover:underline"
                          >
                            {item.product.name}
                          </Link>
                          <p className="truncate font-mono text-[11px] text-muted-foreground">
                            {item.product.code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{item.product.unit.name}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {quantityFormatter.format(item.quantity)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {currencyFormatter.format(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.discountPercent}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {currencyFormatter.format(item.lineTotal)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground tabular-nums">
                        {quantityFormatter.format(delivered)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground tabular-nums">
                        {quantityFormatter.format(remaining)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            item.status === OrderItemStatus.CANCELLED
                              ? "text-destructive"
                              : "text-success"
                          )}
                        >
                          {orderItemStatusLabels[item.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Tổng cộng</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {quantityFormatter.format(totalQuantity)}
                  </TableCell>
                  <TableCell colSpan={2} />
                  <TableCell className="text-right tabular-nums">
                    {currencyFormatter.format(order.subtotal)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {quantityFormatter.format(progress.deliveredQuantity)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {quantityFormatter.format(progress.remainingQuantity)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <OrderDetailPaymentSummary order={order} />
        </div>
      )}
    </OrderDetailSectionCard>
  )
}

function MockColumnHead({ label }: { label: string }) {
  return (
    <TableHead className="text-right">
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="text-[9px] font-normal text-warning">(mẫu)</span>
      </span>
    </TableHead>
  )
}
