import { useCallback, useMemo, useState } from "react"
import { useField } from "@tanstack/react-form"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { unfulfilledOrderItemsQueryOptions } from "@/features/outbound-orders/api/options"
import { buildCreateOutboundOrderPickerColumns } from "@/features/outbound-orders/components/composites/CreateOutboundOrderPickerColumns"
import { useUnfulfilledOrderItemLookup } from "@/features/outbound-orders/hooks/use-unfulfilled-order-item-lookup"
import { createOutboundOrderFormDefaultValues } from "@/features/outbound-orders/schemas/create-outbound-order.schema"
import { withForm } from "@/hooks/use-app-form"
import { cn } from "@/lib/utils"
import type { CreateOutboundOrderItemValue } from "@/features/outbound-orders/schemas/create-outbound-order.schema"
import type { UnfulfilledOrderItem } from "@/lib/types/outbound-order.type"

const limitOptions = [10, 20, 50] as const

// SL giao mặc định bằng toàn bộ SL đặt (BE chưa trả SL đã giao/còn lại ở endpoint picker — đây là
// gợi ý tốt nhất có sẵn, người dùng tự sửa nếu cần). Cùng idiom
// buildPickedOutsourcingReceiptItem trong CreateOutsourcingReceiptPickerSection.tsx. Chỉ giữ 5
// field OutboundOrderItemReqDto cần — không lưu snapshot hiển thị (xem
// create-outbound-order.schema.ts, useUnfulfilledOrderItemLookup).
function buildPickedOutboundOrderItem(
  row: UnfulfilledOrderItem
): CreateOutboundOrderItemValue {
  return {
    orderItemId: row.orderItemId,
    itemId: row.item.id,
    productionJobId: row.job?.id ?? null,
    quantity: row.orderedQuantity,
    note: "",
  }
}

// Bước ① của wizard "Tạo phiếu giao hàng" (DO) — tích các dòng PO chưa hoàn thành cần giao (GET
// /outbound-orders/unfulfilled-order-items). Khách hàng của cả phiếu tự suy ra theo dòng đầu tiên
// được tích — BE bắt buộc mọi dòng cùng 1 khách hàng (E192), nên từ dòng thứ 2 trở đi chỉ được
// tích dòng cùng khách hàng với dòng đã chọn (xem `toggleRow`/`toggleAll`). Không có ô tìm
// kiếm/lọc nào — endpoint hiện chỉ phân trang thuần, DTO có khai q/operationId nhưng service
// không dùng tới field nào trong `where`, nên không dựng UI lọc giả.
export const CreateOutboundOrderPickerSection = withForm({
  defaultValues: createOutboundOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState<(typeof limitOptions)[number]>(10)

    const lookupUnfulfilledOrderItem = useUnfulfilledOrderItemLookup()
    const clientIdField = useField({ form, name: "clientId" })
    // `useField`, không phải `form.Field`'s render-prop — useReactTable/useMemo bên dưới là hook
    // thật, cùng lý do CreateOutsourcingReceiptPickerSection.tsx.
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value
    const lockedClientId =
      items.length > 0
        ? lookupUnfulfilledOrderItem(items[0].orderItemId)?.client.id
        : undefined

    const query = useQuery({
      ...unfulfilledOrderItemsQueryOptions({ page, limit }),
      placeholderData: keepPreviousData,
    })

    const rows = useMemo(() => query.data?.data ?? [], [query.data])
    const pagination = query.data?.pagination
    const pickedIds = useMemo(
      () => new Set(items.map((item) => item.orderItemId)),
      [items]
    )

    const toggleRow = useCallback(
      (row: UnfulfilledOrderItem) => {
        const index = items.findIndex(
          (item) => item.orderItemId === row.orderItemId
        )
        if (index >= 0) {
          itemsField.removeValue(index)
          if (items.length === 1) {
            clientIdField.handleChange("")
          }
          return
        }

        if (lockedClientId !== undefined && lockedClientId !== row.client.id) {
          toast.error(
            "Chỉ có thể chọn các dòng cùng một khách hàng trong 1 phiếu."
          )
          return
        }

        itemsField.pushValue(buildPickedOutboundOrderItem(row))
        if (items.length === 0) {
          clientIdField.handleChange(row.client.id)
        }
      },
      [items, itemsField, clientIdField, lockedClientId]
    )

    const toggleAll = useCallback(
      (checked: boolean) => {
        const pageIds = new Set(rows.map((row) => row.orderItemId))

        if (checked) {
          const toAdd = rows.filter((row) => !pickedIds.has(row.orderItemId))
          const distinctClientIds = new Set(toAdd.map((row) => row.client.id))
          const hasMismatch =
            distinctClientIds.size > 1 ||
            (lockedClientId !== undefined &&
              toAdd.some((row) => row.client.id !== lockedClientId))

          if (hasMismatch) {
            toast.error(
              "Các dòng trên trang này thuộc nhiều khách hàng — hãy thu hẹp trước khi chọn tất cả."
            )
            return
          }

          itemsField.setValue([
            ...items,
            ...toAdd.map(buildPickedOutboundOrderItem),
          ])
          if (items.length === 0 && toAdd.length > 0) {
            clientIdField.handleChange(toAdd[0].client.id)
          }
        } else {
          const remaining = items.filter(
            (item) => !pageIds.has(item.orderItemId)
          )
          itemsField.setValue(remaining)
          if (remaining.length === 0) {
            clientIdField.handleChange("")
          }
        }
      },
      [rows, pickedIds, items, itemsField, clientIdField, lockedClientId]
    )

    const allChecked =
      rows.length > 0 && rows.every((row) => pickedIds.has(row.orderItemId))

    const columns = useMemo(
      () =>
        buildCreateOutboundOrderPickerColumns({
          pickedIds,
          disabled: Boolean(disabled),
          allChecked,
          lockedClientId,
          onToggleRow: toggleRow,
          onToggleAll: toggleAll,
        }),
      [pickedIds, disabled, allChecked, lockedClientId, toggleRow, toggleAll]
    )

    const table = useTable({
      data: rows,
      columns,
      features: appTableFeatures,
    })

    return (
      <div className="px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              ① Chọn PO/Job cần giao
            </h2>
            <p className="text-sm text-muted-foreground">
              Tích các dòng PO cần giao — khách hàng của phiếu tự xác định theo
              dòng đầu tiên bạn chọn.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                KH:{" "}
                {lookupUnfulfilledOrderItem(items[0].orderItemId)?.client
                  .name ?? "—"}
              </span>
            )}
            <span className="text-xs font-medium text-primary">
              Đã chọn {items.length} dòng
            </span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-dashed border-border/50 bg-card">
          <Table aria-label="Danh sách dòng PO/Job cần giao">
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
              className={cn(
                query.isFetching && "pointer-events-none opacity-50"
              )}
              renderEmptyState={() => (
                <TableEmpty
                  colSpan={columns.length}
                  title={
                    query.isPending ? "Đang tải..." : "Không tìm thấy dòng nào"
                  }
                />
              )}
            >
              {(row) => {
                const isPicked = pickedIds.has(row.original.orderItemId)
                const isOtherClient =
                  lockedClientId !== undefined &&
                  row.original.client.id !== lockedClientId

                return (
                  <TableRow
                    id={row.id}
                    className={cn(
                      "h-14 bg-card",
                      isOtherClient
                        ? "opacity-60"
                        : "cursor-pointer hover:bg-muted/25",
                      isPicked && "bg-primary/5"
                    )}
                    onAction={() =>
                      !disabled && !isOtherClient && toggleRow(row.original)
                    }
                    columns={row.getVisibleCells()}
                  >
                    {(cell) => (
                      <TableCell
                        className={cell.column.columnDef.meta?.cellClassName}
                        onClick={(event) =>
                          (cell.column.id === "select" ||
                            cell.column.id === "orderCode" ||
                            cell.column.id === "job") &&
                          event.stopPropagation()
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              }}
            </TableBody>
          </Table>
        </div>

        {pagination && (
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Trang {pagination.currentPage}/{pagination.totalPages} —{" "}
              {pagination.totalRecords} kết quả
            </span>
            <div className="flex items-center gap-2">
              <Select
                selectedKey={String(limit)}
                onSelectionChange={(key) => {
                  setLimit(Number(key) as (typeof limitOptions)[number])
                  setPage(1)
                }}
                isDisabled={disabled}
              >
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {limitOptions.map((option) => (
                    <SelectItem key={option} id={String(option)}>
                      {option} / trang
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                isDisabled={disabled || pagination.currentPage <= 1}
                onPress={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                isDisabled={
                  disabled || pagination.currentPage >= pagination.totalPages
                }
                onPress={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              className="text-xs text-muted-foreground hover:text-destructive"
              isDisabled={disabled}
              onPress={() => {
                itemsField.setValue([])
                clientIdField.handleChange("")
              }}
            >
              Bỏ chọn tất cả
            </Button>
          </div>
        )}
      </div>
    )
  },
})
