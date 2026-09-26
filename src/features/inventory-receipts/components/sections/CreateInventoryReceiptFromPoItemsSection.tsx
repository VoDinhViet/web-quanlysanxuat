import { useMemo, useState } from "react"
import { useField } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Magnifer } from "@solar-icons/react"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { buildCreateInventoryReceiptFromPoItemColumns } from "@/features/inventory-receipts/components/composites/CreateInventoryReceiptFromPoItemsColumns"
import { createInventoryReceiptFromPoFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt-from-po.schema"
import { purchaseOrderQueryOptions } from "@/features/purchase-orders/api"
import { withForm } from "@/hooks/use-app-form"
import { inventoryReceiptAssetTypeLabels } from "@/lib/types/inventory-receipt.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const assetTypeOptions = buildOptionsFromLabels(inventoryReceiptAssetTypeLabels)

// Bước ③ — bật/tắt yêu cầu QC (IQC) cho cả phiếu, rồi nhập SL nhận thực tế + ghi chú cho từng
// dòng đã seed từ bước ②. Footer + 2 khối ghi chú nghiệp vụ theo đúng ảnh mẫu.
export const CreateInventoryReceiptFromPoItemsSection = withForm({
  defaultValues: createInventoryReceiptFromPoFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const [itemSearch, setItemSearch] = useState("")
    const purchaseOrderId = useField({ form, name: "purchaseOrderId" }).state
      .value
    const { isFetching: isPoFetching } = useQuery({
      ...purchaseOrderQueryOptions(purchaseOrderId),
      enabled: Boolean(purchaseOrderId),
    })

    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const searchTerm = itemSearch.trim()

    const filteredItems = useMemo(() => {
      const term = searchTerm.toLowerCase()
      if (!term) return items
      return items.filter(
        (item) =>
          item.itemLabel.toLowerCase().includes(term) ||
          item.note.toLowerCase().includes(term)
      )
    }, [items, searchTerm])

    const columns = useMemo(
      () =>
        buildCreateInventoryReceiptFromPoItemColumns({ itemsField, disabled }),
      [itemsField, disabled]
    )

    const table = useTable({
      data: filteredItems,
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

        {items.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-xs">
              <Input
                id="receipt-from-po-items-search"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm theo tên hoặc mã vật tư..."
                value={itemSearch}
                disabled={disabled}
                onChange={(e) => setItemSearch(e.target.value)}
              />
              <Magnifer className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {searchTerm && (
              <span className="text-xs text-muted-foreground">
                Hiển thị {filteredItems.length} / {items.length} vật tư
              </span>
            )}
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-md border border-border/50 bg-card">
          <Table aria-label="Danh sách vật tư nhận">
            <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
              <TableRow>
                {table.getFlatHeaders().map((header) => (
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
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <TableEmpty
                      colSpan={columns.length}
                      title={
                        isPoFetching
                          ? "Đang tải danh sách vật tư..."
                          : searchTerm
                            ? "Không tìm thấy vật tư phù hợp"
                            : "Chưa có dòng nào"
                      }
                      description={
                        isPoFetching
                          ? "Vui lòng chờ trong giây lát"
                          : searchTerm
                            ? "Thử tìm kiếm với tên hoặc mã vật tư khác."
                            : purchaseOrderId
                              ? "Đơn mua hàng này không còn vật tư nào cần nhập (đã nhận đủ)."
                              : "Quay lại bước ① để chọn PO."
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.original.purchaseOrderItemId}
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
            <li>
              “Số lượng nhận lần này” không được lớn hơn “Số lượng còn lại”.
            </li>
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
