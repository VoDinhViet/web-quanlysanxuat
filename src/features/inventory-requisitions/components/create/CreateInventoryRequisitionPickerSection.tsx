import { useCallback, useMemo, useState } from "react"
import { useField } from "@tanstack/react-form"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
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
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { buildCreateInventoryRequisitionPickerColumns } from "@/features/inventory-requisitions/components/create/CreateInventoryRequisitionPickerColumns"
import { requisitionLinesQueryOptions } from "@/features/inventory-requisitions/api/options"
import { createInventoryRequisitionFormDefaultValues } from "@/features/inventory-requisitions/schemas/create-inventory-requisition.schema"
import { withForm } from "@/hooks/use-app-form"
import { InventoryRequisitionType } from "@/lib/types/inventory-requisition.type"
import { cn } from "@/lib/utils"
import type { InventoryRequisitionItemFormValue } from "@/features/inventory-requisitions/schemas/create-inventory-requisition.schema"
import type { InventoryRequisitionLine } from "@/lib/types/inventory-requisition.type"

const limitOptions = [10, 20, 50] as const

// Gợi ý SL = suggestedQuantity của backend; 0 (BOM đã lãnh đủ, hoặc line không có Job) để trống,
// bắt người dùng tự nhập thay vì submit sẵn một dòng SL=0.
function buildPickedRequisitionItem(
  line: InventoryRequisitionLine
): InventoryRequisitionItemFormValue {
  return {
    itemId: line.item.id,
    quantity: line.suggestedQuantity || undefined,
    note: "",
    line: {
      itemCode: line.item.code,
      itemName: line.item.name,
      unitName: line.item.unit.name,
      bomQuantity: line.bomQuantity,
      issuedQuantity: line.issuedQuantity,
      onHand: line.onHand,
      reservedQuantity: line.reservedQuantity,
      issuableQuantity: line.issuableQuantity,
      availableQuantity: line.availableQuantity,
    },
  }
}

// Thông báo rỗng bảng — tách hàm riêng cho dễ đọc/debug thay vì ternary lồng ngay trong JSX. Có
// đúng 3 trạng thái loại trừ lẫn nhau: chưa chọn Job (chỉ luồng LSX), đang chờ dữ liệu
// (`warehouseId` chưa resolve hoặc query đang pending), hoặc đã tải xong mà không có dòng nào.
function resolveRequisitionLinesEmptyTitle(params: {
  isJobFlow: boolean
  hasProductionJobId: boolean
  hasWarehouseId: boolean
  isPending: boolean
}): string {
  if (params.isJobFlow && !params.hasProductionJobId) {
    return "Chọn Job ở bước ① trước"
  }

  if (params.isPending || !params.hasWarehouseId) {
    return "Đang tải..."
  }

  return "Không tìm thấy vật tư nào"
}

// Checkbox picker rập khuôn PurchaseRequestCreateMaterialPickerSection.tsx — đọc lại
// type/warehouseId/productionJobId của form qua useField (`warehouseId` tự gắn bởi component cha,
// `productionJobId` chọn ở bước Job của luồng LSX). Cả 2 luồng dùng chung 1 API
// (requisitionLinesQueryOptions) — productionJobId optional quyết định có khoanh vùng theo định
// mức BOM của Job hay không, không phải hai nguồn dữ liệu khác nhau. useField, không phải
// form.Field's render-prop: useReactTable/useMemo bên dưới là hook thật, chỉ gọi được ở top level.
export const CreateInventoryRequisitionPickerSection = withForm({
  defaultValues: createInventoryRequisitionFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState<(typeof limitOptions)[number]>(10)
    const [q, setQ] = useState("")
    const [debouncedQ] = useDebounceValue(q, 300)

    const type = useField({ form, name: "type" }).state.value
    const warehouseId = useField({ form, name: "warehouseId" }).state.value
    const productionJobId = useField({ form, name: "productionJobId" }).state
      .value
    const isJobFlow = type === InventoryRequisitionType.PRODUCTION

    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const linesQuery = useQuery({
      ...requisitionLinesQueryOptions({
        warehouseId,
        productionJobId: isJobFlow ? productionJobId || undefined : undefined,
        page,
        limit,
        q: debouncedQ.trim() || undefined,
      }),
      placeholderData: keepPreviousData,
      enabled: Boolean(warehouseId) && (!isJobFlow || Boolean(productionJobId)),
    })

    const toggleRow = useCallback(
      (line: InventoryRequisitionLine) => {
        const index = items.findIndex((item) => item.itemId === line.item.id)
        if (index >= 0) {
          itemsField.removeValue(index)
        } else {
          itemsField.pushValue(buildPickedRequisitionItem(line))
        }
      },
      [items, itemsField]
    )

    const rows = useMemo(() => linesQuery.data?.data ?? [], [linesQuery.data])
    const pagination = linesQuery.data?.pagination
    const pickedIds = useMemo(
      () => new Set(items.map((item) => item.itemId)),
      [items]
    )
    const allChecked =
      rows.length > 0 && rows.every((row) => pickedIds.has(row.item.id))

    // Một `setValue` duy nhất thay vì loop pushValue/removeValue theo từng dòng — cùng lý do
    // PurchaseRequestCreateMaterialPickerColumns.tsx's toggleAll đã ghi chú (mỗi mutation mảng là
    // một lượt validate riêng; loop removeValue còn lệch index giữa chừng).
    const toggleAll = useCallback(
      (checked: boolean) => {
        const pageIds = new Set(rows.map((row) => row.item.id))
        itemsField.setValue(
          checked
            ? [
                ...items,
                ...rows
                  .filter((row) => !pickedIds.has(row.item.id))
                  .map(buildPickedRequisitionItem),
              ]
            : items.filter((item) => !pageIds.has(item.itemId))
        )
      },
      [rows, pickedIds, items, itemsField]
    )

    const columns = useMemo(
      () =>
        buildCreateInventoryRequisitionPickerColumns({
          pickedIds,
          disabled,
          allChecked,
          onToggleRow: toggleRow,
          onToggleAll: toggleAll,
        }),
      [pickedIds, disabled, allChecked, toggleRow, toggleAll]
    )

    const table = useReactTable({
      data: rows,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })

    return (
      <div className="px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              ② Chọn vật tư
            </h2>
            <p className="text-sm text-muted-foreground">
              {isJobFlow
                ? "Danh sách vật tư trong định mức BOM của Job đã chọn."
                : "Mọi vật tư nguyên liệu (RM) tại Kho nguyên vật liệu."}
            </p>
          </div>
          <span className="text-xs font-medium text-primary">
            Đã chọn {items.length} vật tư
          </span>
        </div>

        <div className="mt-4 max-w-sm space-y-1.5">
          <Label
            htmlFor="requisition-picker-search"
            className="text-[11px] font-medium text-muted-foreground"
          >
            Tìm kiếm
          </Label>
          <div className="relative">
            <Input
              id="requisition-picker-search"
              className="pr-9 text-xs placeholder:text-muted-foreground/75"
              placeholder="Tìm theo mã, tên vật tư..."
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

        <div className="mt-4 overflow-x-auto rounded-md border border-dashed border-border/50 bg-card">
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
            <TableBody
              className={cn(
                linesQuery.isFetching && "pointer-events-none opacity-50"
              )}
            >
              {rows.length === 0 ? (
                <TableEmpty
                  colSpan={columns.length}
                  title={resolveRequisitionLinesEmptyTitle({
                    isJobFlow,
                    hasProductionJobId: Boolean(productionJobId),
                    hasWarehouseId: Boolean(warehouseId),
                    isPending: linesQuery.isPending,
                  })}
                />
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.original.item.id}
                    className={cn(
                      "h-14 cursor-pointer bg-card hover:bg-muted/25",
                      pickedIds.has(row.original.item.id) && "bg-primary/5"
                    )}
                    onClick={() => !disabled && toggleRow(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.columnDef.meta?.cellClassName}
                        onClick={(event) =>
                          cell.column.id === "select" && event.stopPropagation()
                        }
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

        {pagination && (
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Trang {pagination.currentPage}/{pagination.totalPages} —{" "}
              {pagination.totalRecords} kết quả
            </span>
            <div className="flex items-center gap-2">
              <Select
                value={String(limit)}
                onValueChange={(value) => {
                  setLimit(Number(value) as (typeof limitOptions)[number])
                  setPage(1)
                }}
                disabled={disabled}
              >
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {limitOptions.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option} / trang
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={disabled || pagination.currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={
                  disabled || pagination.currentPage >= pagination.totalPages
                }
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  },
})
