import { useMemo } from "react"
import { useField } from "@tanstack/react-form"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { buildInventoryReceiptFromPoItemColumns } from "@/features/inventory-receipts/components/composites/InventoryReceiptCreateFromPoItemsColumns"
import { createInventoryReceiptFromPoFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt-from-po.schema"
import { withForm } from "@/hooks/use-app-form"
import { inventoryReceiptAssetTypeLabels } from "@/lib/types/inventory-receipt.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const assetTypeOptions = buildOptionsFromLabels(inventoryReceiptAssetTypeLabels)

// Bước ③ — bật/tắt yêu cầu QC (IQC) cho cả phiếu, rồi nhập SL nhận thực tế + ghi chú cho từng
// dòng đã seed từ bước ②. Footer + 2 khối ghi chú nghiệp vụ theo đúng ảnh mẫu.
export const InventoryReceiptCreateFromPoItemsSection = withForm({
  defaultValues: createInventoryReceiptFromPoFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const columns = useMemo(
      () => buildInventoryReceiptFromPoItemColumns({ itemsField, disabled }),
      [itemsField, disabled]
    )

    const table = useTable({
      data: items,
      columns,
      features: appTableFeatures,
    })

    const totalQuantity = items.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0
    )

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            ③ Nhập số lượng nhận lần này và chọn yêu cầu QC
          </h2>
          <p className="text-sm text-muted-foreground">
            Nhập số lượng nhận cho từng vật tư. Có thể bỏ bớt vật tư nếu không
            nhận.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.AppField name="requiresIqc">
            {(field) => (
              <field.RadioPillField
                label="Yêu cầu QC (IQC) cho phiếu này"
                required
                disabled={disabled}
                options={[
                  { value: "no", label: "Không yêu cầu QC" },
                  { value: "yes", label: "Yêu cầu QC" },
                ]}
              />
            )}
          </form.AppField>

          <form.AppField name="assetType">
            {(field) => (
              <field.RadioPillField
                label="Loại tài sản"
                required
                disabled={disabled}
                options={assetTypeOptions}
              />
            )}
          </form.AppField>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách vật tư nhận">
            <TableHeader
              columns={table.getFlatHeaders()}
              className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45"
            >
              {(header) => (
                <TableHead
                  id={header.id}
                  isRowHeader={header.index === 0}
                  className={header.column.columnDef.meta?.headerClassName}
                >
                  {!header.isPlaceholder &&
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              )}
            </TableHeader>
            <TableBody
              items={table.getRowModel().rows}
              renderEmptyState={() => (
                <TableEmpty
                  colSpan={columns.length}
                  title="Chưa có dòng nào"
                  description="Quay lại bước ① để chọn PO."
                />
              )}
            >
              {(row) => (
                <TableRow
                  id={row.original.purchaseOrderItemId}
                  className="h-16 bg-card hover:bg-muted/25"
                  columns={row.getVisibleCells()}
                >
                  {(cell) => (
                    <TableCell
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Tổng số dòng: {items.length}</span>
          <span>
            Tổng số lượng nhận lần này:{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {quantityFormatter.format(totalQuantity)}
            </span>
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-muted-foreground sm:grid-cols-2">
          <ul className="list-inside list-disc space-y-1">
            <li>“Số lượng nhận lần này” không được lớn hơn “Số lượng đặt”.</li>
            <li>Có thể bỏ bớt (xóa) vật tư khỏi danh sách nhận lần này.</li>
          </ul>
          <ul className="list-inside list-disc space-y-1">
            <li>
              Tích chọn “Yêu cầu QC (IQC)” nếu cần kiểm tra chất lượng đầu vào.
            </li>
            <li>Có thể nhập ghi chú cho từng vật tư (nếu cần).</li>
          </ul>
        </div>
      </div>
    )
  },
})
