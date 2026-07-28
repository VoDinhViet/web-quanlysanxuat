import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { currencyFormatter } from "@/lib/currency"
import {
  ORDER_ITEM_STATUS_LABELS,
  OrderItemStatus,
} from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type OrderDetailItemsTabProps = {
  order: OrderDetail
}

export function OrderDetailItemsTab({ order }: OrderDetailItemsTabProps) {
  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  if (order.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Đơn hàng chưa có sản phẩm nào.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto p-4 sm:p-5">
      <div className="overflow-x-auto rounded-md border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="h-12 hover:bg-muted/45">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>ĐVT</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead className="text-right">Đơn giá</TableHead>
              <TableHead className="text-right">CK (%)</TableHead>
              <TableHead className="text-right">Thành tiền</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item, index) => (
              <TableRow
                key={item.id}
                className="h-14 bg-card hover:bg-muted/25"
              >
                <TableCell className="text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {item.product.name}
                    </p>
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
                <TableCell className="text-center">
                  <span
                    className={
                      item.status === OrderItemStatus.CANCELLED
                        ? "text-destructive"
                        : "text-success"
                    }
                  >
                    {ORDER_ITEM_STATUS_LABELS[item.status]}
                  </span>
                </TableCell>
              </TableRow>
            ))}
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
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
