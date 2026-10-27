import { useState } from "react"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { AddCircle, Tag } from "@solar-icons/react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/shared/composites/Pagination"
import type { PageSize } from "@/components/shared/composites/Pagination"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { CreateItemCategoryDialog } from "@/features/item-categories/components/composites/CreateItemCategoryDialog"
import { itemCategoryColumns } from "@/features/item-categories/components/composites/ItemCategoriesTableColumns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ItemCategory } from "@/lib/types/item-category.type"

type ItemCategoriesTableProps = {
  itemCategories: ItemCategory[]
  isPending: boolean
  hasFilter: boolean
}

// No server pagination: GET /item-categories returns the whole (small) catalogue, so paging is
// local.
export function ItemCategoriesTable({
  itemCategories,
  isPending,
  hasFilter,
}: ItemCategoriesTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(10)

  // Clamp so deleting the last row of the last page doesn't strand the user on an empty page.
  const lastPage = Math.max(1, Math.ceil(itemCategories.length / pageSize))
  const currentPage = Math.min(page, lastPage)
  const pageItemCategories = itemCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const table = useTable({
    data: pageItemCategories,
    columns: itemCategoryColumns,
    features: appTableFeatures,
  })

  return (
    <div
      className={cn(
        "min-w-0 flex-1 transition-opacity",
        isPending && "pointer-events-none opacity-50"
      )}
    >
      {itemCategories.length === 0 ? (
        <div className="p-4 sm:p-5">
          <TableEmpty
            icon={Tag}
            title={
              hasFilter
                ? "Không tìm thấy nhóm phù hợp"
                : "Chưa có nhóm vật tư nào"
            }
            description={
              hasFilter
                ? "Thử đổi từ khoá tìm kiếm hoặc xoá bộ lọc."
                : "Bắt đầu bằng cách thêm nhóm vật tư đầu tiên, vd. Vật tư hàn, Bulong, Thép."
            }
            action={
              hasFilter ? undefined : (
                <PermissionGate permission="items:create">
                  <CreateItemCategoryDialog
                    trigger={
                      <Button size="sm" className="text-xs">
                        <AddCircle className="size-4" />
                        Thêm nhóm vật tư
                      </Button>
                    }
                  />
                </PermissionGate>
              )
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto bg-card">
          <Table aria-label="Danh sách nhóm vật tư">
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
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-14 bg-card hover:bg-muted/25"
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
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Tổng {itemCategories.length} nhóm vật tư
            </p>
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              total={itemCategories.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
