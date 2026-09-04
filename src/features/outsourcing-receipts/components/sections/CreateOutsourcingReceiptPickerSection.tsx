import { useCallback, useMemo, useState } from "react"
import { useField } from "@tanstack/react-form"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { toast } from "sonner"
import { useDebounceValue } from "usehooks-ts"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Label } from "@/components/ui/label"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { useGetOperationOptions } from "@/features/operations/api"
import { pendingOrderItemsQueryOptions } from "@/features/outsourcing-receipts/api/options"
import { buildCreateOutsourcingReceiptPickerColumns } from "@/features/outsourcing-receipts/components/composites/CreateOutsourcingReceiptPickerColumns"
import { createOutsourcingReceiptFormDefaultValues } from "@/features/outsourcing-receipts/schemas/create-outsourcing-receipt.schema"
import { withForm } from "@/hooks/use-app-form"
import { cn } from "@/lib/utils"
import type { CreateOutsourcingReceiptItemValue } from "@/features/outsourcing-receipts/schemas/create-outsourcing-receipt.schema"
import type { PendingOrderItem } from "@/lib/types/outsourcing-receipt.type"

const limitOptions = [10, 20, 50] as const

// SL nhận mặc định bằng toàn bộ SL đã gửi (BE chưa trả SL đã nhận/còn lại ở endpoint picker —
// đây là gợi ý tốt nhất có sẵn, người dùng tự sửa nếu cần); trọng lượng/diện tích mặc định lấy
// theo dữ liệu OS-OUT của dòng đó — ghi chú để trống, BE không có field gợi ý ghi chú per-dòng.
// Cùng idiom buildPickedOutsourcingOrderItem trong CreateOutsourcingOrderPickerSection.tsx.
function buildPickedOutsourcingReceiptItem(
  row: PendingOrderItem
): CreateOutsourcingReceiptItemValue {
  return {
    outsourcingOrderItemId: row.id,
    outsourcingOrderId: row.outsourcingOrder.id,
    outsourcingOrderCode: row.outsourcingOrder.code,
    sendDate: row.outsourcingOrder.sendDate,
    supplierId: row.supplier.id,
    supplierName: row.supplier.name,
    productionJobCode: row.jobCode,
    itemCode: row.item.code,
    itemName: row.item.name,
    unitName: row.unit.name,
    operationCode: row.operationCode,
    operationName: row.operationName,
    sentQuantity: row.quantity,
    quantity: row.quantity,
    weight: row.weight ?? undefined,
    area: row.area ?? undefined,
    note: "",
  }
}

// Bước ① của wizard "Nhập hàng gia công về" (OS-IN) — tích các dòng OS-OUT cần nhận (GET
// /outsourcing-receipts/pending-order-items, hiện đủ mọi NCC ngay từ đầu — NCC không phải chọn
// trước). NCC của cả phiếu tự suy ra theo dòng đầu tiên được tích — BE bắt buộc
// mọi dòng cùng 1 NCC (E187), nên từ dòng thứ 2 trở đi chỉ được tích dòng cùng NCC với dòng đã
// chọn (xem `toggleRow`/`toggleAll`, và cột "NCC" để phân biệt các dòng). Cùng cấu trúc
// checkbox-nhiều-dòng như CreateOutsourcingOrderPickerSection.tsx.
export const CreateOutsourcingReceiptPickerSection = withForm({
  defaultValues: createOutsourcingReceiptFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState<(typeof limitOptions)[number]>(10)
    const [q, setQ] = useState("")
    const [debouncedQ] = useDebounceValue(q, 300)
    const [operationId, setOperationId] = useState<string | undefined>()

    const supplierIdField = useField({ form, name: "supplierId" })
    // `useField`, không phải `form.Field`'s render-prop — useReactTable/useMemo bên dưới là hook
    // thật, cùng lý do CreateOutsourcingOrderPickerSection.tsx.
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value
    const lockedSupplierId = items.length > 0 ? items[0].supplierId : undefined

    const { options: operationOptions } = useGetOperationOptions()

    const query = useQuery({
      ...pendingOrderItemsQueryOptions({
        page,
        limit,
        q: debouncedQ.trim() || undefined,
        operationId,
      }),
      placeholderData: keepPreviousData,
    })

    const rows = useMemo(() => query.data?.data ?? [], [query.data])
    const pagination = query.data?.pagination
    const pickedIds = useMemo(
      () => new Set(items.map((item) => item.outsourcingOrderItemId)),
      [items]
    )

    const toggleRow = useCallback(
      (row: PendingOrderItem) => {
        const index = items.findIndex(
          (item) => item.outsourcingOrderItemId === row.id
        )
        if (index >= 0) {
          itemsField.removeValue(index)
          if (items.length === 1) {
            supplierIdField.handleChange("")
          }
          return
        }

        if (items.length > 0 && items[0].supplierId !== row.supplier.id) {
          toast.error(
            "Chỉ có thể chọn các dòng cùng một nhà cung cấp trong 1 phiếu."
          )
          return
        }

        itemsField.pushValue(buildPickedOutsourcingReceiptItem(row))
        if (items.length === 0) {
          supplierIdField.handleChange(row.supplier.id)
        }
      },
      [items, itemsField, supplierIdField]
    )

    const toggleAll = useCallback(
      (checked: boolean) => {
        const pageIds = new Set(rows.map((row) => row.id))

        if (checked) {
          const toAdd = rows.filter((row) => !pickedIds.has(row.id))
          const distinctSupplierIds = new Set(
            toAdd.map((row) => row.supplier.id)
          )
          const hasMismatch =
            distinctSupplierIds.size > 1 ||
            (lockedSupplierId !== undefined &&
              toAdd.some((row) => row.supplier.id !== lockedSupplierId))

          if (hasMismatch) {
            toast.error(
              "Các dòng trên trang này thuộc nhiều nhà cung cấp — hãy tìm kiếm để thu hẹp trước khi chọn tất cả."
            )
            return
          }

          itemsField.setValue([
            ...items,
            ...toAdd.map(buildPickedOutsourcingReceiptItem),
          ])
          if (items.length === 0 && toAdd.length > 0) {
            supplierIdField.handleChange(toAdd[0].supplier.id)
          }
        } else {
          const remaining = items.filter(
            (item) => !pageIds.has(item.outsourcingOrderItemId)
          )
          itemsField.setValue(remaining)
          if (remaining.length === 0) {
            supplierIdField.handleChange("")
          }
        }
      },
      [rows, pickedIds, items, itemsField, supplierIdField, lockedSupplierId]
    )

    const allChecked =
      rows.length > 0 && rows.every((row) => pickedIds.has(row.id))

    const columns = useMemo(
      () =>
        buildCreateOutsourcingReceiptPickerColumns({
          pickedIds,
          disabled: Boolean(disabled),
          allChecked,
          lockedSupplierId,
          onToggleRow: toggleRow,
          onToggleAll: toggleAll,
        }),
      [pickedIds, disabled, allChecked, lockedSupplierId, toggleRow, toggleAll]
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
              ① Chọn hàng cần nhận
            </h2>
            <p className="text-sm text-muted-foreground">
              Tích các dòng OS-OUT cần nhận về — nhà cung cấp của phiếu tự xác
              định theo dòng đầu tiên bạn chọn.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                NCC: {items[0].supplierName}
              </span>
            )}
            <span className="text-xs font-medium text-primary">
              Đã chọn {items.length} dòng
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="os-in-picker-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
            <div className="relative">
              <Input
                id="os-in-picker-search"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Mã OS-OUT, công đoạn..."
                value={q}
                disabled={disabled}
                onChange={(event) => {
                  setQ(event.target.value)
                  setPage(1)
                }}
              />
              <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="os-in-picker-operation"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Công đoạn
            </Label>
            <Select
              selectedKey={operationId ?? "all"}
              onSelectionChange={(key) => {
                const value = String(key)
                setOperationId(value === "all" ? undefined : value)
                setPage(1)
              }}
              isDisabled={disabled}
              placeholder="Tất cả công đoạn"
            >
              <SelectTrigger
                id="os-in-picker-operation"
                className="w-full text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem id="all">Tất cả công đoạn</SelectItem>
                {operationOptions.map((option) => (
                  <SelectItem key={option.value} id={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-dashed border-border/50 bg-card">
          <Table aria-label="Danh sách dòng cần nhận">
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
                const isPicked = pickedIds.has(row.original.id)
                const isOtherSupplier =
                  lockedSupplierId !== undefined &&
                  row.original.supplier.id !== lockedSupplierId

                return (
                  <TableRow
                    id={row.id}
                    className={cn(
                      "h-14 bg-card",
                      isOtherSupplier
                        ? "opacity-60"
                        : "cursor-pointer hover:bg-muted/25",
                      isPicked && "bg-primary/5"
                    )}
                    onAction={() =>
                      !disabled && !isOtherSupplier && toggleRow(row.original)
                    }
                    columns={row.getVisibleCells()}
                  >
                    {(cell) => (
                      <TableCell
                        className={cell.column.columnDef.meta?.cellClassName}
                        onClick={(event) =>
                          (cell.column.id === "select" ||
                            cell.column.id === "outsourcingOrderCode") &&
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
                supplierIdField.handleChange("")
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
