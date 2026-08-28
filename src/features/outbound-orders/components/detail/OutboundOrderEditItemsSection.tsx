import { useMemo, useState } from "react"
import { useField } from "@tanstack/react-form"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { OutboundOrderAddItemsDialog } from "@/features/outbound-orders/components/detail/OutboundOrderAddItemsDialog"
import { buildOutboundOrderEditItemColumns } from "@/features/outbound-orders/components/detail/OutboundOrderEditItemsColumns"
import { updateOutboundOrderFormDefaultValues } from "@/features/outbound-orders/schemas/update-outbound-order.schema"
import { withForm } from "@/hooks/use-app-form"
import type { OutboundOrderItemDisplay } from "@/features/outbound-orders/components/detail/OutboundOrderEditItemsColumns"
import type {
  OutboundOrderItem,
  UnfulfilledOrderItem,
} from "@/lib/types/outbound-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

function toDisplayFromItem(item: OutboundOrderItem): OutboundOrderItemDisplay {
  return {
    order: item.order,
    job: item.productionJob,
    item: item.item,
    unit: item.unit,
    orderedQuantity: item.orderedQuantity,
    issuedQuantity: item.issuedQuantity,
    onHandQuantity: item.onHandQuantity,
    heldQuantity: item.heldQuantity,
    availableQuantity: item.availableQuantity,
  }
}

function toDisplayFromUnfulfilled(
  row: UnfulfilledOrderItem
): OutboundOrderItemDisplay {
  return {
    order: row.order,
    job: row.job,
    item: row.item,
    unit: row.unit,
    orderedQuantity: row.orderedQuantity,
    issuedQuantity: row.issuedQuantity,
    onHandQuantity: row.onHandQuantity,
    heldQuantity: row.heldQuantity,
    availableQuantity: row.availableQuantity,
  }
}

// Bảng dòng ở chế độ Sửa (BUG-090, edit-inline trên trang Chi tiết) — sửa SL/ghi chú/bỏ dòng có
// sẵn, và thêm dòng mới qua "+ Thêm từ PO/Job" (OutboundOrderAddItemsDialog.tsx, khác quyết định
// ban đầu "chỉ sửa/xóa dòng có sẵn" — đã mở rộng theo ảnh mock-up UI Spec). `displayByOrderItemId`
// là Map hiển thị (order/job/item/unit/4 cột tồn kho) — seed từ `items` lúc vào trang, thêm entry
// mới mỗi khi thêm dòng qua popup; form state chỉ giữ 5 field wire nên không tự có dữ liệu này.
export const OutboundOrderEditItemsSection = withForm({
  defaultValues: updateOutboundOrderFormDefaultValues,
  props: {
    disabled: false,
    clientId: "",
    outboundOrderId: "",
    items: [] as OutboundOrderItem[],
  },
  render: function Render({
    form,
    disabled,
    clientId,
    outboundOrderId,
    items,
  }) {
    const itemsField = useField({ form, name: "items" })
    const formItems = itemsField.state.value

    const [displayByOrderItemId, setDisplayByOrderItemId] = useState(
      () =>
        new Map(
          items.map((item) => [item.orderItemId, toDisplayFromItem(item)])
        )
    )

    const pickedOrderItemIds = useMemo(
      () => new Set(formItems.map((item) => item.orderItemId)),
      [formItems]
    )

    function handleAdd(row: UnfulfilledOrderItem) {
      itemsField.pushValue({
        orderItemId: row.orderItemId,
        itemId: row.item.id,
        productionJobId: row.job?.id ?? null,
        quantity: row.orderedQuantity,
        note: "",
      })
      setDisplayByOrderItemId((prev) =>
        new Map(prev).set(row.orderItemId, toDisplayFromUnfulfilled(row))
      )
    }

    const columns = useMemo(
      () =>
        buildOutboundOrderEditItemColumns({
          itemsField,
          disabled,
          displayByOrderItemId,
        }),
      [itemsField, disabled, displayByOrderItemId]
    )

    const table = useReactTable({
      data: formItems,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })

    const totalQuantity = formItems.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0
    )

    return (
      <div className="border-b border-border not-first:border-t">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
          <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">
            Danh sách thành phẩm giao hàng
          </h3>
          <OutboundOrderAddItemsDialog
            clientId={clientId}
            outboundOrderId={outboundOrderId}
            alreadyPickedOrderItemIds={pickedOrderItemIds}
            onAdd={handleAdd}
            trigger={
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
              >
                <Plus className="size-3.5" />
                Thêm từ PO/Job
              </Button>
            }
          />
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="h-12 hover:bg-muted/45"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={header.column.columnDef.meta?.headerClassName}
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
              {formItems.length === 0 ? (
                <TableEmpty
                  colSpan={columns.length}
                  title="Chưa có dòng nào"
                  description="Phiếu cần ít nhất một dòng giao hàng."
                />
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.original.orderItemId}
                    className="h-16 bg-card hover:bg-muted/25"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.columnDef.meta?.cellClassName}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-muted-foreground sm:px-5">
          <span>Tổng số dòng: {formItems.length}</span>
          <span>
            Tổng SL giao:{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {quantityFormatter.format(totalQuantity)}
            </span>
          </span>
        </div>
      </div>
    )
  },
})
