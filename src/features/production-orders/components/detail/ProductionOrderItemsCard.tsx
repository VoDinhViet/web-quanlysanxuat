import boxBold from "@iconify-icons/solar/box-bold"
import { Icon } from "@iconify/react"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { withForm } from "@/hooks/use-app-form"
import { updateProductionOrderFormDefaultValues } from "@/features/production-orders/schemas/update-production-order.schema"
import { ProductionOrderDecisionStatus } from "@/lib/types/production-order.type"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

export const ProductionOrderItemsCard = withForm({
  defaultValues: updateProductionOrderFormDefaultValues,
  props: {
    production: {} as ProductionOrderDetail,
  },
  render: function Render({ form, production }) {
    const isPending =
      production.status === ProductionOrderDecisionStatus.PENDING
    const { items } = production

    const totalOrderQty = items.reduce((sum, item) => sum + item.orderQty, 0)
    const totalOnHandQty = items.reduce((sum, item) => sum + item.onHandQty, 0)
    const totalAvailableQty = items.reduce(
      (sum, item) => sum + item.availableQty,
      0
    )
    const totalSuggestedQty = items.reduce(
      (sum, item) => sum + item.quantity,
      0
    )

    return (
      <div>
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
              <Icon icon={boxBold} className="size-4 text-muted-foreground" />
              Quyết định sản xuất
            </h2>
            <p className="text-sm text-muted-foreground">
              Số lượng sản xuất theo từng dòng sản phẩm của đơn hàng
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Đơn hàng không có dòng sản phẩm nào cần lập kế hoạch sản xuất.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-md border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="h-12 hover:bg-muted/45">
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Mã sản phẩm</TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead className="text-right">
                        SL theo đơn hàng
                      </TableHead>
                      <TableHead className="text-right">
                        Tồn kho TP (Hiện có)
                      </TableHead>
                      <TableHead className="text-right">
                        Tồn kho TP (Khả dụng)
                      </TableHead>
                      <TableHead className="text-right">
                        Đề xuất sản xuất (Tự động)
                      </TableHead>
                      <TableHead className="text-right">
                        Số lượng sản xuất
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow
                        key={item.orderItemId}
                        className="h-14 bg-card hover:bg-muted/25"
                      >
                        <TableCell className="text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {item.product.code}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {item.product.name}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {quantityFormatter.format(item.orderQty)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {quantityFormatter.format(item.onHandQty)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {quantityFormatter.format(item.availableQty)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-medium tabular-nums",
                            item.quantity > 0
                              ? "text-destructive"
                              : "text-success"
                          )}
                        >
                          {quantityFormatter.format(item.quantity)}
                        </TableCell>
                        <TableCell className="text-right">
                          {isPending ? (
                            <form.Field name={`items[${index}].quantity`}>
                              {(field) => (
                                <Input
                                  type="number"
                                  min={0}
                                  value={field.state.value}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                  onBlur={field.handleBlur}
                                  className="ml-auto h-8 w-24 text-right text-xs tabular-nums"
                                  aria-label={`Số lượng sản xuất cho ${item.product.name}`}
                                />
                              )}
                            </form.Field>
                          ) : (
                            <span className="font-medium tabular-nums">
                              {quantityFormatter.format(item.quantity)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3}>Tổng cộng</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {quantityFormatter.format(totalOrderQty)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {quantityFormatter.format(totalOnHandQty)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {quantityFormatter.format(totalAvailableQty)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {quantityFormatter.format(totalSuggestedQty)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        <form.Subscribe
                          selector={(state) => state.values.items}
                        >
                          {(formItems) =>
                            quantityFormatter.format(
                              formItems.reduce(
                                (sum, formItem) =>
                                  sum + (Number(formItem.quantity) || 0),
                                0
                              )
                            )
                          }
                        </form.Subscribe>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Công thức: Khả dụng = Tồn kho TP hiện có − số đã giữ chỗ bởi LSX
                khác. Đề xuất sản xuất = SL theo đơn hàng − Khả dụng (nếu Khả
                dụng ≥ 0, ngược lại bằng SL theo đơn hàng). Số lượng sản xuất có
                thể chỉnh khác với đề xuất.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  },
})
