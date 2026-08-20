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
import { ComboboxField } from "@/components/shared/inputs/ComboboxField"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { useGetClientOptions } from "@/features/clients/api"
import { materialsQueryOptions } from "@/features/materials/api"
import { buildPurchaseRequestMaterialPickerColumns } from "@/features/purchase-requests/components/create/PurchaseRequestCreateMaterialPickerColumns"
import { createPurchaseRequestFormDefaultValues } from "@/features/purchase-requests/schemas/create-purchase-request.schema"
import { withForm } from "@/hooks/use-app-form"
import { ItemStatus } from "@/lib/types/item.type"
import { cn } from "@/lib/utils"
import type { PurchaseRequestItemFormValue } from "@/features/purchase-requests/schemas/purchase-request-item-form.schema"
import type { Material } from "@/lib/types/material.type"

const limitOptions = [10, 20, 50] as const

// Only ACTIVE materials are pickable — an inactive vật tư can't be proposed for purchase. Not
// user-facing: unlike MaterialsTableFilter's status dropdown, this picker fixes the filter
// itself rather than offering a choice.
function buildPickedPurchaseRequestItem(
  material: Material
): PurchaseRequestItemFormValue {
  return {
    itemId: material.id,
    itemCode: material.code,
    itemName: material.name,
    itemUnit: material.unit.name,
    minStock: material.minStock,
    quantity: 1,
    note: "",
  }
}

export const PurchaseRequestCreateMaterialPickerSection = withForm({
  defaultValues: createPurchaseRequestFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState<(typeof limitOptions)[number]>(10)
    const [q, setQ] = useState("")
    const [debouncedQ] = useDebounceValue(q, 300)
    const [clientId, setClientId] = useState<string | undefined>()

    // `useField`, not `form.Field`'s render-prop — useReactTable/useMemo below are real hooks
    // and can only be called at the component's top level, not inside a nested render-prop
    // callback. Same field API either way, mirrors
    // CreateQuotationItemsPickerSection.tsx (the repo's other checkbox-picker wizard step).
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const client = useGetClientOptions()

    const materialsQuery = useQuery({
      ...materialsQueryOptions({
        page,
        limit,
        q: debouncedQ.trim() || undefined,
        clientId,
        status: ItemStatus.ACTIVE,
      }),
      placeholderData: keepPreviousData,
    })

    const toggleRow = useCallback(
      (material: Material) => {
        const index = items.findIndex((item) => item.itemId === material.id)
        if (index >= 0) {
          itemsField.removeValue(index)
        } else {
          itemsField.pushValue(buildPickedPurchaseRequestItem(material))
        }
      },
      [items, itemsField]
    )

    const rows = useMemo(
      () => materialsQuery.data?.data ?? [],
      [materialsQuery.data]
    )
    const pagination = materialsQuery.data?.pagination
    const pickedIds = useMemo(
      () => new Set(items.map((item) => item.itemId)),
      [items]
    )
    const allChecked =
      rows.length > 0 && rows.every((row) => pickedIds.has(row.id))

    // Single `setValue` commit instead of one pushValue/removeValue per row: each array-field
    // mutation is its own form-store write + validation pass, so toggling a full page of 50 was
    // ~50 store writes. It also sidesteps a real bug the per-row loop had — the uncheck branch ran
    // `items.findIndex` against the closed-over `items` snapshot while `removeValue` shifted the
    // live array's indices out from under it mid-loop, deleting the wrong rows after the first.
    const toggleAll = useCallback(
      (checked: boolean) => {
        const pageIds = new Set(rows.map((row) => row.id))
        itemsField.setValue(
          checked
            ? [
                ...items,
                ...rows
                  .filter((row) => !pickedIds.has(row.id))
                  .map(buildPickedPurchaseRequestItem),
              ]
            : items.filter((item) => !pageIds.has(item.itemId))
        )
      },
      [rows, pickedIds, items, itemsField]
    )

    const columns = useMemo(
      () =>
        buildPurchaseRequestMaterialPickerColumns({
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
              Danh mục vật tư
            </h2>
            <p className="text-sm text-muted-foreground">
              Tích chọn vật tư cần mua. Chỉ hiện vật tư đang sử dụng.
            </p>
          </div>
          <span className="text-xs font-medium text-primary">
            Đã chọn {items.length} vật tư
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(16rem,1.6fr)_minmax(12rem,1fr)]">
          <div className="space-y-1.5">
            <Label
              htmlFor="purchase-request-picker-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
            <div className="relative">
              <Input
                id="purchase-request-picker-search"
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

          <div className="space-y-1.5">
            <Label
              htmlFor="purchase-request-picker-client"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Khách hàng
            </Label>
            <ComboboxField
              id="purchase-request-picker-client"
              value={clientId}
              onValueChange={(value) => {
                setClientId(value)
                setPage(1)
              }}
              options={client.options}
              onSearchChange={client.onSearchChange}
              isPending={client.isFetching}
              emptyMessage="Không tìm thấy khách hàng"
              placeholder="Tìm khách hàng..."
              disabled={disabled}
              className="text-xs"
            />
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-dashed border-border/50 bg-card">
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
                materialsQuery.isFetching && "pointer-events-none opacity-50"
              )}
            >
              {rows.length === 0 ? (
                <TableEmpty
                  colSpan={columns.length}
                  title={
                    materialsQuery.isPending
                      ? "Đang tải..."
                      : "Không tìm thấy vật tư nào"
                  }
                />
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "h-14 cursor-pointer bg-card hover:bg-muted/25",
                      pickedIds.has(row.original.id) && "bg-primary/5"
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
