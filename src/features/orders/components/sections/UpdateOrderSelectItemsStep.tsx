import { useCallback, useMemo, useState } from "react"
import { useField } from "@tanstack/react-form"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { Gallery, Magnifer } from "@solar-icons/react"
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
import { Pagination } from "@/components/shared/composites/Pagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { inventoryProductsQueryOptions } from "@/features/inventory-products/api"
import { buildOrderItemsSelectColumns } from "@/features/orders/components/composites/OrderItemsSelectColumns"
import type { SelectableProduct } from "@/features/orders/components/composites/OrderItemsSelectColumns"
import { updateOrderFormDefaultValues } from "@/features/orders/schemas/update-order.schema"
import { withForm } from "@/hooks/use-app-form"
import type { ProductInventoryItem } from "@/lib/types/inventory-product.type"
import { OrderItemStatus } from "@/lib/types/order.type"
import type { PageSize } from "@/components/shared/composites/Pagination"

// Bước ② của wizard: danh mục sản phẩm có ảnh/tồn kho, tìm kiếm + phân trang, tick chọn nhiều —
// tick là ghi thẳng vào `items` field-array của form (pushValue/removeValue qua useField), cùng
// khuôn CreateOrderSelectItemsStep.tsx (TanStack Form). Một dòng đang CANCELLED vẫn hiện tick
// (vẫn "thuộc" đơn hàng) — bỏ tick 1 dòng bất kỳ, kể cả đã huỷ, là xoá hẳn dòng đó khỏi đơn
// (replace-all khi lưu). Huỷ 1 dòng (khác xoá) là việc của cột Trạng thái ở bước ③
// (UpdateOrderQuantitiesStep.tsx), đừng nhầm 2 thao tác.
export const UpdateOrderSelectItemsStep = withForm({
  defaultValues: updateOrderFormDefaultValues,
  props: {},
  render: function Render({ form }) {
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value
    const selectedItemIds = useMemo(
      () => new Set(items.map((item) => item.itemId)),
      [items]
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
        const index = items.findIndex((field) => field.itemId === item.id)
        if (index >= 0) {
          itemsField.removeValue(index)
          return
        }
        itemsField.pushValue({
          itemId: item.id,
          itemLabel: item.name,
          itemUnit: item.unit.name,
          quantity: 1,
          unitPrice: 0,
          discountPercent: 0,
          note: "",
          status: OrderItemStatus.NORMAL,
        })
      },
      [items, itemsField]
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
          if (newItems.length > 0) {
            itemsField.setValue([...items, ...newItems])
          }
          return
        }

        const idsOnPage = new Set(products.map((product) => product.id))
        itemsField.setValue(items.filter((item) => !idsOnPage.has(item.itemId)))
      },
      [products, selectedItemIds, items, itemsField]
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
            <TableHeader className="[&>tr]:h-12">
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
                      icon={Gallery}
                      colSpan={columns.length}
                      title={
                        query.isPending
                          ? "Đang tải..."
                          : "Không tìm thấy sản phẩm"
                      }
                      description={
                        query.isPending ? undefined : "Thử một từ khoá khác."
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.original.id}
                    className="h-14 cursor-pointer bg-card transition-colors hover:bg-muted/25"
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
          />
        )}
      </div>
    )
  },
})
