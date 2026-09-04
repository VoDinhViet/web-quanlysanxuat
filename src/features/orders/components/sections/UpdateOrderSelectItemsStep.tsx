import { useCallback, useMemo, useState } from "react"
import { useFieldArray } from "react-hook-form"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Gallery, Magnifer } from "@solar-icons/react"
import { useDebounceValue } from "usehooks-ts"
import type { UseFormReturn } from "react-hook-form"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/shared/composites/Pagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { inventoryProductsQueryOptions } from "@/features/inventory-products/api"
import { buildOrderItemsSelectColumns } from "@/features/orders/components/composites/OrderItemsSelectColumns"
import type { SelectableProduct } from "@/features/orders/components/composites/OrderItemsSelectColumns"
import type { UpdateOrderSchema } from "@/features/orders/schemas/update-order.schema"
import type { ProductInventoryItem } from "@/lib/types/inventory-product.type"
import { OrderItemStatus } from "@/lib/types/order.type"
import { cn } from "@/lib/utils"
import type { PageSize } from "@/components/shared/composites/Pagination"

type UpdateOrderSelectItemsStepProps = {
  form: UseFormReturn<UpdateOrderSchema>
}

// Bước ② của wizard: danh mục sản phẩm có ảnh/tồn kho, tìm kiếm + phân trang, tick chọn nhiều —
// tick là ghi thẳng vào `items` field-array của form (append/remove qua useFieldArray), thay cho
// popup OrderItemsPickerDialog.tsx đã xoá. Một dòng đang CANCELLED vẫn hiện tick (vẫn "thuộc" đơn
// hàng) — bỏ tick 1 dòng bất kỳ, kể cả đã huỷ, là xoá hẳn dòng đó khỏi đơn (replace-all khi lưu).
// Huỷ 1 dòng (khác xoá) là việc của cột Trạng thái ở bước ③ (UpdateOrderQuantitiesStep.tsx), đừng
// nhầm 2 thao tác.
export function UpdateOrderSelectItemsStep({
  form,
}: UpdateOrderSelectItemsStepProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })
  const selectedItemIds = useMemo(
    () => new Set(fields.map((field) => field.itemId)),
    [fields]
  )

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(10)
  const [q, setQ] = useState("")
  const [debouncedQ] = useDebounceValue(q, 300)

  const query = useQuery({
    ...inventoryProductsQueryOptions({
      page,
      limit: pageSize,
      q: debouncedQ.trim() || undefined,
    }),
    placeholderData: keepPreviousData,
  })

  const products = useMemo(() => query.data?.data ?? [], [query.data])
  const pagination = query.data?.pagination

  const allChecked =
    products.length > 0 &&
    products.every((product) => selectedItemIds.has(product.id))

  const selectableProducts: SelectableProduct[] = useMemo(
    () =>
      products.map((product) => ({
        ...product,
        isSelected: selectedItemIds.has(product.id),
      })),
    [products, selectedItemIds]
  )

  const toggleItem = useCallback(
    (item: ProductInventoryItem) => {
      const index = fields.findIndex((field) => field.itemId === item.id)
      if (index >= 0) {
        remove(index)
        return
      }
      append(
        {
          itemId: item.id,
          itemLabel: item.name,
          itemUnit: item.unit.name,
          quantity: 1,
          unitPrice: 0,
          discountPercent: 0,
          note: "",
          status: OrderItemStatus.NORMAL,
        },
        { shouldFocus: false }
      )
    },
    [fields, append, remove]
  )

  const toggleAllOnPage = useCallback(
    (checked: boolean) => {
      if (checked) {
        const newItems = products
          .filter((product) => !selectedItemIds.has(product.id))
          .map((item) => ({
            itemId: item.id,
            itemLabel: item.name,
            itemUnit: item.unit.name,
            quantity: 1,
            unitPrice: 0,
            discountPercent: 0,
            note: "",
            status: OrderItemStatus.NORMAL,
          }))
        if (newItems.length > 0) append(newItems, { shouldFocus: false })
        return
      }

      const idsOnPage = new Set(products.map((product) => product.id))
      fields
        .map((field, index) => ({ field, index }))
        .filter(({ field }) => idsOnPage.has(field.itemId))
        .sort((a, b) => b.index - a.index)
        .forEach(({ index }) => remove(index))
    },
    [products, selectedItemIds, fields, append, remove]
  )

  const columns = useMemo(
    () =>
      buildOrderItemsSelectColumns({
        allChecked,
        onToggleRow: toggleItem,
        onToggleAll: toggleAllOnPage,
      }),
    [allChecked, toggleItem, toggleAllOnPage]
  )

  const table = useTable({
    data: selectableProducts,
    columns,
    features: appTableFeatures,
  })

  return (
    <div className="px-4 py-5 sm:px-5">
      <div>
        <h2 className="font-heading text-base font-semibold text-foreground">
          Chọn sản phẩm
        </h2>
        <p className="text-sm text-muted-foreground">
          {`Đã chọn ${selectedItemIds.size} sản phẩm — tick chọn để thêm/bỏ khỏi đơn hàng`}
        </p>
      </div>

      <div className="relative mt-4">
        <Input
          className="pr-9 text-xs placeholder:text-muted-foreground/75"
          placeholder="Tìm mã hoặc tên sản phẩm..."
          value={q}
          onChange={(event) => {
            setQ(event.target.value)
            setPage(1)
          }}
        />
        <Magnifer className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      <div className="mt-4 max-h-[420px] overflow-x-auto overflow-y-auto rounded-md border border-dashed border-border/50 bg-card">
        <Table aria-label="Danh mục sản phẩm">
          <TableHeader columns={table.getFlatHeaders()} className="[&>tr]:h-12">
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
            className={cn(query.isFetching && "pointer-events-none opacity-50")}
            renderEmptyState={() => (
              <TableEmpty
                icon={Gallery}
                colSpan={columns.length}
                title={
                  query.isPending ? "Đang tải..." : "Không tìm thấy sản phẩm"
                }
                description={
                  query.isPending ? undefined : "Thử một từ khoá khác."
                }
              />
            )}
          >
            {(row) => (
              <TableRow
                id={row.original.id}
                className={cn(
                  "h-14 cursor-pointer bg-card transition-colors hover:bg-muted/25",
                  row.original.isSelected && "border-l-2 border-primary"
                )}
                onAction={() => toggleItem(row.original)}
                columns={row.getVisibleCells()}
              >
                {(cell) => (
                  <TableCell
                    className={cell.column.columnDef.meta?.cellClassName}
                    onClick={(event) =>
                      cell.column.id === "select" && event.stopPropagation()
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                )}
              </TableRow>
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
        />
      )}
    </div>
  )
}
