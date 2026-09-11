import { useCallback, useMemo, useState } from "react"
import { useField } from "@tanstack/react-form"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Search } from "lucide-react"
import { useDebounceValue } from "usehooks-ts"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Pagination } from "@/components/shared/composites/Pagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { materialsQueryOptions } from "@/features/materials/api"
import { buildInventoryReceiptReturnPickerColumns } from "@/features/inventory-receipts/components/composites/InventoryReceiptCreateReturnPickerColumns"
import { createInventoryReceiptReturnFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt-return.schema"
import { withForm } from "@/hooks/use-app-form"
import { ItemStatus } from "@/lib/types/item.type"
import { inventoryReceiptItemDefaultValue } from "@/features/inventory-receipts/schemas/inventory-receipt-item-form.schema"
import { cn } from "@/lib/utils"
import type { InventoryReceiptItemFormValue } from "@/features/inventory-receipts/schemas/inventory-receipt-item-form.schema"
import type { Material } from "@/lib/types/material.type"
import type { PageSize } from "@/components/shared/composites/Pagination"

function buildPickedReturnItem(
  material: Material
): InventoryReceiptItemFormValue {
  return {
    ...inventoryReceiptItemDefaultValue,
    itemId: material.id,
    itemLabel: `${material.code} — ${material.name}`,
    itemUnit: material.unit.name,
  }
}

// Bước ② của wizard "Khách hàng" — checkbox picker rập khuôn
// PurchaseRequestCreateMaterialPickerSection.tsx/CreateInventoryRequisitionPickerSection.tsx. Lọc
// sẵn theo `clientId` đã chọn ở bước ① (vật tư master data đã gắn `client` — không cần combobox
// khách hàng riêng như bản purchase-requests, vốn chưa biết trước khách hàng nào).
export const InventoryReceiptCreateReturnPickerSection = withForm({
  defaultValues: createInventoryReceiptReturnFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState<PageSize>(10)
    const [q, setQ] = useState("")
    const [debouncedQ] = useDebounceValue(q, 300)

    const clientId = useField({ form, name: "clientId" }).state.value
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const materialsQuery = useQuery({
      ...materialsQueryOptions({
        page,
        limit: pageSize,
        q: debouncedQ.trim() || undefined,
        clientId: clientId || undefined,
        status: ItemStatus.ACTIVE,
      }),
      placeholderData: keepPreviousData,
      enabled: Boolean(clientId),
    })

    const toggleRow = useCallback(
      (material: Material) => {
        const index = items.findIndex((item) => item.itemId === material.id)
        if (index >= 0) {
          itemsField.removeValue(index)
        } else {
          itemsField.pushValue(buildPickedReturnItem(material))
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

    const toggleAll = useCallback(
      (checked: boolean) => {
        const pageIds = new Set(rows.map((row) => row.id))
        itemsField.setValue(
          checked
            ? [
                ...items,
                ...rows
                  .filter((row) => !pickedIds.has(row.id))
                  .map(buildPickedReturnItem),
              ]
            : items.filter((item) => !pageIds.has(item.itemId))
        )
      },
      [rows, pickedIds, items, itemsField]
    )

    const columns = useMemo(
      () =>
        buildInventoryReceiptReturnPickerColumns({
          pickedIds,
          disabled,
          allChecked,
          onToggleRow: toggleRow,
          onToggleAll: toggleAll,
        }),
      [pickedIds, disabled, allChecked, toggleRow, toggleAll]
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
              ② Chọn vật tư
            </h2>
            <p className="text-sm text-muted-foreground">
              Vật tư đã đăng ký sẵn trong danh mục cho khách hàng đang chọn.
            </p>
          </div>
          <span className="text-xs font-medium text-primary">
            Đã chọn {items.length} vật tư
          </span>
        </div>

        <div className="mt-4 max-w-sm space-y-1.5">
          <Label
            htmlFor="inventory-receipt-return-picker-search"
            className="text-[11px] font-medium text-muted-foreground"
          >
            Tìm kiếm
          </Label>
          <div className="relative">
            <Input
              id="inventory-receipt-return-picker-search"
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
          <Table aria-label="Danh sách vật tư">
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
                        !clientId
                          ? "Chọn khách hàng ở bước ① trước"
                          : materialsQuery.isPending
                            ? "Đang tải..."
                            : "Không tìm thấy vật tư nào"
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.original.id}
                    className={cn(
                      "h-14 cursor-pointer bg-card hover:bg-muted/25",
                      pickedIds.has(row.original.id) && "bg-primary/5"
                    )}
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

        {pagination && (
          <Pagination
            page={pagination.currentPage}
            pageSize={pagination.limit}
            total={pagination.totalRecords}
            onPageChange={setPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize)
              setPage(1)
            }}
            disabled={disabled}
            className="mt-3"
          />
        )}
      </div>
    )
  },
})
