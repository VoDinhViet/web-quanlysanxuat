import boxBold from "@iconify-icons/solar/box-bold"
import { Icon } from "@iconify/react"
import { TriangleAlert } from "lucide-react"
import type { ReactNode } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { FieldError } from "@/components/ui/field"
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
import { PermissionGate } from "@/components/shared/PermissionGate"
import { withForm } from "@/hooks/use-app-form"
import { findChangedProductionQuantities } from "@/features/production-orders/production-order-decision"
import { updateProductionOrderFormDefaultValues } from "@/features/production-orders/schemas/update-production-order.schema"
import { ProductionOrderStatus } from "@/lib/types/production-order.type"
import type {
  ProductionOrderDetail,
  ProductionOrderDetailItem,
} from "@/lib/types/production-order.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type ProductionOrderItemRowProps = {
  item: ProductionOrderDetailItem
  index: number
  // Rendered by the caller (where `form` is fully typed via `withForm`) rather than taking
  // `form` as a prop here — `AnyFormApi` doesn't carry the `.Field` render-prop typings, only
  // the concrete `useAppForm`/`withForm` instance does.
  quantityCell: ReactNode
}

// Split out of ProductionOrderItemsCard's render (code-quality.md: split over ~150 lines).
function ProductionOrderItemRow({
  item,
  index,
  quantityCell,
}: ProductionOrderItemRowProps) {
  return (
    <TableRow className="h-14 bg-card hover:bg-muted/25">
      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
      <TableCell className="font-mono text-xs">{item.product.code}</TableCell>
      <TableCell className="font-medium text-foreground">
        {item.product.name}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {quantityFormatter.format(item.orderQty)}
      </TableCell>
      <TableCell className="text-right font-medium text-info tabular-nums">
        {quantityFormatter.format(item.onHandQty)}
      </TableCell>
      <TableCell className="text-right font-medium text-info tabular-nums">
        {quantityFormatter.format(item.availableQty)}
      </TableCell>
      <TableCell className="text-right">{quantityCell}</TableCell>
      <TableCell className="text-right text-muted-foreground tabular-nums">
        {quantityFormatter.format(item.fromStockQty)}
      </TableCell>
    </TableRow>
  )
}

type ProductionOrderQuantityStaticProps = {
  quantity: number
}

function ProductionOrderQuantityStatic({
  quantity,
}: ProductionOrderQuantityStaticProps) {
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        quantity > 0 ? "text-destructive" : "text-success"
      )}
    >
      {quantityFormatter.format(quantity)}
    </span>
  )
}

export const ProductionOrderItemsCard = withForm({
  defaultValues: updateProductionOrderFormDefaultValues,
  props: {
    production: {} as ProductionOrderDetail,
    isSaving: false,
  },
  render: function Render({ form, production, isSaving }) {
    const isPending = production.status === ProductionOrderStatus.PENDING
    const { items } = production

    const totalOrderQty = items.reduce((sum, item) => sum + item.orderQty, 0)
    const totalOnHandQty = items.reduce((sum, item) => sum + item.onHandQty, 0)
    const totalAvailableQty = items.reduce(
      (sum, item) => sum + item.availableQty,
      0
    )
    const totalFromStockQty = items.reduce(
      (sum, item) => sum + item.fromStockQty,
      0
    )

    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
        noValidate
      >
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
                        Số lượng sản xuất
                      </TableHead>
                      <TableHead className="text-right">Lấy từ tồn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <ProductionOrderItemRow
                        key={item.orderItemId}
                        item={item}
                        index={index}
                        quantityCell={
                          isPending ? (
                            <PermissionGate
                              permission="production:update"
                              fallback={
                                <ProductionOrderQuantityStatic
                                  quantity={item.quantity}
                                />
                              }
                            >
                              <form.Field name={`items[${index}].quantity`}>
                                {(field) => (
                                  <div className="ml-auto flex w-24 flex-col items-end gap-1">
                                    <Input
                                      type="number"
                                      min={0}
                                      step="any"
                                      value={field.state.value}
                                      onChange={(event) =>
                                        field.handleChange(event.target.value)
                                      }
                                      onBlur={field.handleBlur}
                                      disabled={isSaving}
                                      aria-invalid={
                                        field.state.meta.isTouched &&
                                        field.state.meta.errors.length > 0
                                      }
                                      aria-label={`Số lượng sản xuất cho ${item.product.name}`}
                                      className="h-8 w-24 text-right text-xs tabular-nums"
                                    />
                                    <FieldError
                                      errors={field.state.meta.errors}
                                      className="text-right text-[11px]"
                                    />
                                  </div>
                                )}
                              </form.Field>
                            </PermissionGate>
                          ) : (
                            <ProductionOrderQuantityStatic
                              quantity={item.quantity}
                            />
                          )
                        }
                      />
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="h-14">
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
                      <TableCell className="text-right font-medium tabular-nums">
                        {quantityFormatter.format(totalFromStockQty)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Công thức: Khả dụng = Tồn kho TP hiện có − số đã giữ chỗ bởi LSX
                khác. Số lượng sản xuất được điền sẵn bằng SL theo đơn hàng −
                Khả dụng (nếu Khả dụng ≥ 0, ngược lại bằng SL theo đơn hàng) tại
                thời điểm đơn hàng được duyệt, và có thể chỉnh lại khi LSX còn
                chờ duyệt. Lấy từ tồn = SL theo đơn hàng − Số lượng sản xuất
                (không âm), được tính lại sau mỗi lần lưu.
              </p>

              <form.Subscribe
                selector={(state) =>
                  findChangedProductionQuantities(state.values, production)
                    .length > 0
                }
              >
                {(hasUnsavedChanges) =>
                  hasUnsavedChanges ? (
                    <Alert className="border-warning/30 bg-warning/10 py-2.5">
                      <TriangleAlert className="text-warning" />
                      <AlertDescription className="text-xs text-warning/90">
                        Có thay đổi chưa lưu. Nhấn "Lưu thay đổi" để cập nhật số
                        lượng sản xuất trước khi duyệt LSX.
                      </AlertDescription>
                    </Alert>
                  ) : null
                }
              </form.Subscribe>
            </div>
          )}
        </div>
      </form>
    )
  },
})
