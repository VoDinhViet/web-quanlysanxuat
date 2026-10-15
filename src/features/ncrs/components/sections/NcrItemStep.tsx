import { useState } from "react"
import { useField } from "@tanstack/react-form"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { Magnifer } from "@solar-icons/react"
import { useDebounceValue } from "usehooks-ts"

import { Pagination } from "@/components/shared/composites/Pagination"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup } from "@/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buildNcrItemPickerColumns } from "@/features/ncrs/components/composites/NcrItemPickerColumns"
import { NcrCreateStepCard } from "@/features/ncrs/components/layouts/NcrCreateStepCard"
import { createNcrFormDefaultValues } from "@/features/ncrs/schemas/create-ncr.schema"
import { itemsQueryOptions } from "@/features/products/api"
import { withForm } from "@/hooks/use-app-form"
import { appTableFeatures } from "@/lib/table-features"
import { ItemStatus } from "@/lib/types/item.type"
import type { Item } from "@/lib/types/item.type"
import { cn } from "@/lib/utils"

const columns = buildNcrItemPickerColumns()

type NcrItemStepProps = {
  disabled: boolean
  selectedItem: Item | undefined
  onItemChange: (item: Item | undefined) => void
}

const defaultProps: NcrItemStepProps = {
  disabled: false,
  selectedItem: undefined,
  onItemChange: () => undefined,
}

// Step 2: searchable single-pick table of active FG products. `onItemChange` hands the full
// Item up so the order step, unit label and summary can read it.
export const NcrItemStep = withForm({
  defaultValues: createNcrFormDefaultValues,
  props: defaultProps,
  render: function Render({ form, disabled, selectedItem, onItemChange }) {
    const [page, setPage] = useState(1)
    const [q, setQ] = useState("")
    const [debouncedQ] = useDebounceValue(q, 300)
    const itemIdField = useField({ form, name: "itemId" })

    const itemsQuery = useQuery({
      ...itemsQueryOptions({
        page,
        limit: 10,
        q: debouncedQ.trim() || undefined,
        status: ItemStatus.ACTIVE,
      }),
      placeholderData: keepPreviousData,
    })
    const items = itemsQuery.data?.data ?? []
    const pagination = itemsQuery.data?.pagination

    const reactTable = useTable({
      data: items,
      columns,
      features: appTableFeatures,
    })

    function handleSelect(itemId: string) {
      // Re-clicking the picked product must not reset the order chosen under it.
      if (disabled || itemId === selectedItem?.id) return
      const item = items.find((candidate) => candidate.id === itemId)
      itemIdField.handleChange(itemId)
      onItemChange(item)
    }

    return (
      <NcrCreateStepCard
        step={2}
        title="Chọn sản phẩm"
        description="Thành phẩm bị lỗi — mỗi NCR chỉ cho một sản phẩm"
        isDone={selectedItem !== undefined}
      >
        <div className="space-y-3">
          <div className="relative max-w-xs">
            <Input
              className="pr-9 text-xs placeholder:text-muted-foreground/75"
              placeholder="Tìm theo mã hoặc tên sản phẩm..."
              aria-label="Tìm sản phẩm"
              value={q}
              disabled={disabled}
              // Enter would otherwise submit the whole create form.
              onKeyDown={(event) => {
                if (event.key === "Enter") event.preventDefault()
              }}
              onChange={(event) => {
                setQ(event.target.value)
                setPage(1)
              }}
            />
            <Magnifer className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <RadioGroup
            value={itemIdField.state.value}
            onValueChange={handleSelect}
            disabled={disabled}
            className="block gap-0 overflow-x-auto rounded-md border border-border/50 bg-card"
          >
            <Table aria-label="Danh sách sản phẩm">
              <TableHeader className="[&>tr]:h-11 [&>tr]:hover:bg-muted/45">
                <TableRow>
                  {reactTable.getFlatHeaders().map((header) => (
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
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      <TableEmpty
                        colSpan={columns.length}
                        title={
                          itemsQuery.isPending
                            ? "Đang tải..."
                            : "Không tìm thấy sản phẩm"
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  reactTable.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "h-12 bg-card hover:bg-muted/25",
                        !disabled && "cursor-pointer",
                        row.original.id === selectedItem?.id &&
                          "bg-primary/[0.04] hover:bg-primary/[0.08]"
                      )}
                      onClick={() => handleSelect(row.original.id)}
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
          </RadioGroup>

          {itemIdField.state.meta.isTouched && (
            <FieldError errors={itemIdField.state.meta.errors} />
          )}

          {pagination && (
            <Pagination
              page={pagination.currentPage}
              pageSize={pagination.limit}
              total={pagination.totalRecords}
              onPageChange={setPage}
              disabled={disabled}
            />
          )}
        </div>
      </NcrCreateStepCard>
    )
  },
})
