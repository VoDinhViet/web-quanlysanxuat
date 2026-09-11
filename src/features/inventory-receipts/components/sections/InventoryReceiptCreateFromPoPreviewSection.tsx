import { useField } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { createInventoryReceiptFromPoFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt-from-po.schema"
import { purchaseOrderQueryOptions } from "@/features/purchase-orders/api"
import { withForm } from "@/hooks/use-app-form"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Bước ② — xem trước đọc-only các dòng của PO đã chọn ở bước ① (việc seed `items` cho bước ③
// được thực hiện ở cấp form cha trong InventoryReceiptCreateFromPoForm.tsx).
export const InventoryReceiptCreateFromPoPreviewSection = withForm({
  defaultValues: createInventoryReceiptFromPoFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form }) {
    const purchaseOrderId = useField({ form, name: "purchaseOrderId" }).state
      .value

    const { data: purchaseOrder, isFetching } = useQuery({
      ...purchaseOrderQueryOptions(purchaseOrderId),
      enabled: Boolean(purchaseOrderId),
    })

    const lines = purchaseOrder?.items ?? []

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            ② Xem trước nội dung đơn mua
          </h2>
          {purchaseOrder ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-mono font-semibold text-primary">
                {purchaseOrder.code}
              </span>{" "}
              — {purchaseOrder.supplier.name}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Xem trước chi tiết vật tư của PO đã chọn.
            </p>
          )}
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-dashed border-border/50 bg-card">
          <Table aria-label="Danh sách vật tư đơn mua hàng">
            <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
              <TableRow>
                <TableHead id="index" className="w-14 text-center">
                  STT
                </TableHead>
                <TableHead id="code" className="min-w-32">
                  Mã vật tư
                </TableHead>
                <TableHead id="name" className="min-w-44">
                  Tên vật tư
                </TableHead>
                <TableHead id="unit" className="w-20">
                  ĐVT
                </TableHead>
                <TableHead id="quantity" className="w-28 text-right">
                  SL đặt
                </TableHead>
                <TableHead id="received" className="w-28 text-right">
                  SL đã nhận
                </TableHead>
                <TableHead id="remaining" className="w-28 text-right">
                  Còn lại
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <TableEmpty
                      colSpan={7}
                      title={
                        isFetching
                          ? "Đang tải dòng đơn mua hàng..."
                          : "Đơn mua hàng không có dòng nào"
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                lines.map((line, index) => {
                  const received = line.receivedQuantity
                  const remaining = Math.max(line.quantity - received, 0)
                  return (
                    <TableRow key={line.id} id={line.id} className="h-12 bg-card">
                      <TableCell className="text-center text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-foreground">
                        {line.purchaseRequestItem.item.code}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {line.purchaseRequestItem.item.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {line.purchaseRequestItem.item.unit.name}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {quantityFormatter.format(line.quantity)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {quantityFormatter.format(received)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums font-semibold",
                          remaining === 0
                            ? "text-muted-foreground font-normal"
                            : "text-foreground"
                        )}
                      >
                        {remaining === 0 ? "Đã nhận đủ" : quantityFormatter.format(remaining)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  },
})
