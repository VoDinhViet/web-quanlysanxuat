import { Box } from "@solar-icons/react"
import { PackageSearch, TriangleAlert } from "lucide-react"
import { useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { FieldError } from "@/components/ui/field"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { withForm } from "@/hooks/use-app-form"
import { getChangedProductionItems } from "@/features/production-orders/logic/production-order-decision"
import { buildProductionOrderItemsColumns } from "@/features/production-orders/components/composites/ProductionOrderItemsColumns"
import { updateProductionOrderFormDefaultValues } from "@/features/production-orders/schemas/update-production-order.schema"
import { ProductionOrderStatus } from "@/lib/types/production-order.type"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

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

    const columns = useMemo(
      () =>
        buildProductionOrderItemsColumns({
          renderQuantityCell: (item, index) =>
            isPending ? (
              <PermissionGate
                permission="production:update"
                fallback={
                  <ProductionOrderQuantityStatic quantity={item.quantity} />
                }
              >
                <form.Field name={`items[${index}].quantity`}>
                  {(field) => (
                    <div className="ml-auto flex w-24 flex-col items-end gap-1">
                      <NumericCellInput
                        min={0}
                        value={field.state.value}
                        onValueChange={field.handleChange}
                        disabled={isSaving}
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
              <ProductionOrderQuantityStatic quantity={item.quantity} />
            ),
        }),
      [form, isPending, isSaving]
    )

    const table = useReactTable({
      data: items,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })

    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (form.state.isSubmitting) return
          form.handleSubmit()
        }}
        noValidate
      >
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
              <Box className="size-4 text-muted-foreground" />
              Quyết định sản xuất
            </h2>
            <p className="text-sm text-muted-foreground">
              Số lượng sản xuất theo từng dòng sản phẩm của đơn hàng
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {items.length === 0 ? (
            <TableEmpty
              icon={PackageSearch}
              title="Đơn hàng không có dòng sản phẩm nào cần lập kế hoạch sản xuất"
              description="Danh sách dòng sản phẩm cần lập kế hoạch sản xuất sẽ hiện ở đây khi có dữ liệu."
            />
          ) : (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-md border border-border/50">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow
                        key={headerGroup.id}
                        className="h-12 hover:bg-muted/45"
                      >
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className={
                              header.column.columnDef.meta?.headerClassName
                            }
                          >
                            {!header.isPlaceholder &&
                              flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.original.orderItemId}
                        className="h-14 bg-card hover:bg-muted/25"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={
                              cell.column.columnDef.meta?.cellClassName
                            }
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
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
                                  sum + (formItem.quantity ?? 0),
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
                  getChangedProductionItems(state.values, production).length > 0
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
