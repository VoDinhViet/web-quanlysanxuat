import { useCallback, useMemo, useState } from "react"
import { useField } from "@tanstack/react-form"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
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
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { useGetOperationOptions } from "@/features/operations/api"
import { outsourceableOperationsQueryOptions } from "@/features/outsourcing-orders/api/options"
import { buildCreateOutsourcingOrderPickerColumns } from "@/features/outsourcing-orders/components/composites/CreateOutsourcingOrderPickerColumns"
import { createOutsourcingOrderFormDefaultValues } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"
import { useGetProductionJobOptions } from "@/features/production-jobs/api"
import { withForm } from "@/hooks/use-app-form"
import { cn } from "@/lib/utils"
import type { CreateOutsourcingOrderItemValue } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"
import type { OutsourceableOperation } from "@/lib/types/outsourcing-order.type"

const limitOptions = [10, 20, 50] as const

// Item form value mirrors OutsourceableOperation field-for-field (xem create-outsourcing-order.schema.ts)
// cộng 4 field nhập mới, nên chọn 1 dòng chỉ cần spread — không liệt kê lại từng ref lồng thủ công.
// SL gửi lần này mặc định bằng toàn bộ "Còn được phép gửi" — người dùng chỉnh xuống ở bước ② nếu
// chỉ gửi một phần, thay vì phải gõ lại từ ô trống mỗi dòng.
function buildPickedOutsourcingOrderItem(
  row: OutsourceableOperation
): CreateOutsourcingOrderItemValue {
  return {
    ...row,
    quantity: row.remainingQuantity,
    weight: undefined,
    area: undefined,
    note: "",
  }
}

export const CreateOutsourcingOrderPickerSection = withForm({
  defaultValues: createOutsourcingOrderFormDefaultValues,
  props: {
    disabled: false,
    // Deep-link tuỳ chọn (xem CreateOutsourcingOrderForm.tsx) — chỉ seed giá trị khởi tạo cho 2
    // filter bên dưới, không tự động tick chọn dòng nào.
    initialProductionJobId: undefined as string | undefined,
    initialOperationId: undefined as string | undefined,
  },
  render: function Render({
    form,
    disabled,
    initialProductionJobId,
    initialOperationId,
  }) {
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState<(typeof limitOptions)[number]>(10)
    const [q, setQ] = useState("")
    const [debouncedQ] = useDebounceValue(q, 300)
    const [productionJobId, setProductionJobId] = useState(
      initialProductionJobId
    )
    const [operationId, setOperationId] = useState(initialOperationId)

    const { options: jobOptions } = useGetProductionJobOptions()
    const { options: operationOptions } = useGetOperationOptions()

    // `useField`, not `form.Field`'s render-prop — useReactTable/useMemo below are real hooks,
    // same reasoning as PurchaseRequestCreateMaterialPickerSection.tsx.
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const query = useQuery({
      ...outsourceableOperationsQueryOptions({
        page,
        limit,
        q: debouncedQ.trim() || undefined,
        productionJobId,
        operationId,
      }),
      placeholderData: keepPreviousData,
    })

    const rows = useMemo(() => query.data?.data ?? [], [query.data])
    const pagination = query.data?.pagination
    const pickedOperationIds = useMemo(
      () => new Set(items.map((item) => item.productionJobOperationId)),
      [items]
    )

    const toggleRow = useCallback(
      (row: OutsourceableOperation) => {
        const index = items.findIndex(
          (item) =>
            item.productionJobOperationId === row.productionJobOperationId
        )
        if (index >= 0) {
          itemsField.removeValue(index)
        } else {
          itemsField.pushValue(buildPickedOutsourcingOrderItem(row))
        }
      },
      [items, itemsField]
    )

    const pickableRows = useMemo(
      () => rows.filter((row) => row.remainingQuantity > 0),
      [rows]
    )

    const toggleAll = useCallback(
      (checked: boolean) => {
        const pageIds = new Set(
          pickableRows.map((row) => row.productionJobOperationId)
        )
        itemsField.setValue(
          checked
            ? [
                ...items,
                ...pickableRows
                  .filter(
                    (row) =>
                      !pickedOperationIds.has(row.productionJobOperationId)
                  )
                  .map(buildPickedOutsourcingOrderItem),
              ]
            : items.filter(
                (item) => !pageIds.has(item.productionJobOperationId)
              )
        )
      },
      [pickableRows, pickedOperationIds, items, itemsField]
    )

    const allChecked =
      pickableRows.length > 0 &&
      pickableRows.every((row) =>
        pickedOperationIds.has(row.productionJobOperationId)
      )

    const columns = useMemo(
      () =>
        buildCreateOutsourcingOrderPickerColumns({
          pickedOperationIds,
          disabled: Boolean(disabled),
          allChecked,
          onToggleRow: toggleRow,
          onToggleAll: toggleAll,
        }),
      [pickedOperationIds, disabled, allChecked, toggleRow, toggleAll]
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
              ① Chọn chi tiết cần gia công
            </h2>
            <p className="text-sm text-muted-foreground">
              Tích chọn các chi tiết cần gửi đi gia công ngoài. Chi tiết đã gửi
              đủ định mức không chọn được nữa.
            </p>
          </div>
          <span className="text-xs font-medium text-primary">
            Đã chọn {items.length} chi tiết
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="os-out-picker-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
            <div className="relative">
              <Input
                id="os-out-picker-search"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Mã Job, mã/tên chi tiết..."
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
              htmlFor="os-out-picker-job"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Job
            </Label>
            <Select
              value={productionJobId ?? "all"}
              onValueChange={(value) => {
                setProductionJobId(value === "all" ? undefined : value)
                setPage(1)
              }}
              disabled={disabled}
            >
              <SelectTrigger id="os-out-picker-job" className="w-full text-xs">
                <SelectValue placeholder="Tất cả Job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả Job</SelectItem>
                {jobOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="os-out-picker-operation"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Công đoạn
            </Label>
            <Select
              value={operationId ?? "all"}
              onValueChange={(value) => {
                setOperationId(value === "all" ? undefined : value)
                setPage(1)
              }}
              disabled={disabled}
            >
              <SelectTrigger
                id="os-out-picker-operation"
                className="w-full text-xs"
              >
                <SelectValue placeholder="Tất cả công đoạn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả công đoạn</SelectItem>
                {operationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                query.isFetching && "pointer-events-none opacity-50"
              )}
            >
              {rows.length === 0 ? (
                <TableEmpty
                  colSpan={columns.length}
                  title={
                    query.isPending
                      ? "Đang tải..."
                      : "Không tìm thấy chi tiết nào"
                  }
                />
              ) : (
                table.getRowModel().rows.map((row) => {
                  const isPicked = pickedOperationIds.has(
                    row.original.productionJobOperationId
                  )
                  const isLocked = row.original.remainingQuantity <= 0

                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "h-14 bg-card",
                        isLocked
                          ? "opacity-60"
                          : "cursor-pointer hover:bg-muted/25",
                        isPicked && "bg-primary/5"
                      )}
                      onClick={() =>
                        !disabled && !isLocked && toggleRow(row.original)
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cell.column.columnDef.meta?.cellClassName}
                          onClick={(event) =>
                            cell.column.id === "select" &&
                            event.stopPropagation()
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
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
