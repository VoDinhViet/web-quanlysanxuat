import { useEffect, useRef } from "react"
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
import { TableEmptyRow } from "@/components/shared/feedback/TableEmptyRow"
import { createInventoryReceiptFromPoFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt-from-po.schema"
import { purchaseOrderQueryOptions } from "@/features/purchase-orders/api"
import { withForm } from "@/hooks/use-app-form"
import type { InventoryReceiptFromPoItemValue } from "@/features/inventory-receipts/schemas/create-inventory-receipt-from-po.schema"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Bước ② — xem trước đọc-only các dòng của PO đã chọn ở bước ①, đồng thời seed `items` (dùng ở
// bước ③) từ đúng các dòng này. Seed một lần mỗi khi đổi PO (không seed lại mỗi render — sẽ ghi
// đè SL nhận người dùng vừa sửa ở bước ③) qua `seededForRef` so với `purchaseOrder.id` đã fetch.
export const InventoryReceiptCreateFromPoPreviewSection = withForm({
  defaultValues: createInventoryReceiptFromPoFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form }) {
    const purchaseOrderId = useField({ form, name: "purchaseOrderId" }).state
      .value
    const itemsField = useField({ form, name: "items" })

    const { data: purchaseOrder, isFetching } = useQuery({
      ...purchaseOrderQueryOptions(purchaseOrderId),
      enabled: Boolean(purchaseOrderId),
    })

    const seededForRef = useRef<string | null>(null)
    useEffect(() => {
      if (!purchaseOrder || seededForRef.current === purchaseOrder.id) return
      seededForRef.current = purchaseOrder.id

      const items: InventoryReceiptFromPoItemValue[] = purchaseOrder.items.map(
        (line) => ({
          purchaseOrderItemId: line.id,
          itemId: line.purchaseRequestItem.item.id,
          itemLabel: `${line.purchaseRequestItem.item.code} — ${line.purchaseRequestItem.item.name}`,
          itemUnit: line.purchaseRequestItem.item.unit.name,
          requestedQuantity: line.quantity,
          quantity: String(line.quantity),
          note: "",
        })
      )
      itemsField.handleChange(items)
    }, [purchaseOrder, itemsField])

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

        {purchaseOrder && !purchaseOrder.receiptWarehouse && (
          <p className="mt-3 text-xs text-destructive">
            PO này chưa khai báo kho nhận — không thể tạo phiếu nhập kho từ PO
            này. Vui lòng bổ sung kho nhận trên PO trước.
          </p>
        )}

        <div className="mt-4 overflow-hidden rounded-md border border-dashed border-border/50 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="h-12 hover:bg-muted/45">
                <TableHead className="w-14 text-center">STT</TableHead>
                <TableHead className="min-w-32">Mã vật tư</TableHead>
                <TableHead className="min-w-44">Tên vật tư</TableHead>
                <TableHead className="w-20">ĐVT</TableHead>
                <TableHead className="w-28 text-right">SL đặt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.length === 0 ? (
                <TableEmptyRow
                  colSpan={5}
                  message={
                    isFetching
                      ? "Đang tải dòng đơn mua hàng..."
                      : "Đơn mua hàng không có dòng nào"
                  }
                />
              ) : (
                lines.map((line, index) => (
                  <TableRow key={line.id} className="h-12 bg-card">
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  },
})
