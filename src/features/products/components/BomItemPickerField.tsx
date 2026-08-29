import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  AltArrowLeft,
  AltArrowRight,
  BoxMinimalistic,
  Magnifier,
} from "@solar-icons/react"
import { CircleCheck } from "lucide-react"
import { useDebounceValue } from "usehooks-ts"
import type { ComponentProps } from "react"

import { Badge } from "@/components/ui/badge"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { buildBomItemPickerColumns } from "@/features/products/components/BomItemPickerColumns"
import { materialsQueryOptions } from "@/features/materials/api"
import { itemsQueryOptions } from "@/features/products/api/options"
import type { BomItemPickerRow } from "@/features/products/components/BomItemPickerColumns"
import type { BomItemType } from "@/lib/types/bom-item.type"
import { ItemType } from "@/lib/types/item.type"
import { cn } from "@/lib/utils"

const limitOptions = [10, 20, 50] as const

type BomItemPickerFieldProps = {
  itemType: BomItemType
  value: string
  onValueChange: (value: string) => void
  onBlur?: () => void
  isInvalid?: boolean
  errors?: ComponentProps<typeof FieldError>["errors"]
}

// Replaces a plain combobox with a searchable, paginated table — the "add BOM
// item" picker needs to show enough of each candidate (image, unit, khách
// hàng) that a code+name dropdown row can't disambiguate on its own. Backed
// by whichever list already has real pagination for the node's type: WIP
// looks up `getItems` (products, type=WIP), RM looks up `getMaterials` — both
// are used behind their own `enabled` flag so only the relevant one fetches.
export function BomItemPickerField({
  itemType,
  value,
  onValueChange,
  onBlur,
  isInvalid,
  errors,
}: BomItemPickerFieldProps) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<(typeof limitOptions)[number]>(10)
  const [q, setQ] = useState("")
  const [debouncedQ] = useDebounceValue(q, 300)
  // Cached separately from `value` (which only ever holds the id) so the
  // "Đã chọn" badge keeps showing the picked row's code/name/unit even after
  // paging or searching it out of the current result page.
  const [selectedLabel, setSelectedLabel] = useState<{
    code: string
    name: string
    unit: string
  } | null>(null)

  const itemsQuery = useQuery({
    ...itemsQueryOptions({
      page,
      limit,
      q: debouncedQ.trim() || undefined,
      type: ItemType.WIP,
    }),
    enabled: itemType === "WIP",
    placeholderData: keepPreviousData,
  })
  const materialsQuery = useQuery({
    ...materialsQueryOptions({
      page,
      limit,
      q: debouncedQ.trim() || undefined,
    }),
    enabled: itemType === "RM",
    placeholderData: keepPreviousData,
  })

  const query = itemType === "WIP" ? itemsQuery : materialsQuery
  const rows: BomItemPickerRow[] = query.data?.data ?? []
  const pagination = query.data?.pagination

  function handleSelectRow(row: BomItemPickerRow) {
    onValueChange(row.id)
    setSelectedLabel({ code: row.code, name: row.name, unit: row.unit.name })
  }

  const columns = buildBomItemPickerColumns({ selectedId: value })
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel className="text-xs font-medium text-foreground">
        {itemType === "WIP" ? "Bán Thành Phẩm (WIP)" : "Vật Tư (RM)"}{" "}
        <span className="text-destructive">*</span>
      </FieldLabel>

      <div className="mt-1.5 space-y-2.5">
        <div className="relative">
          <Input
            className="pr-9 text-xs placeholder:text-muted-foreground/75"
            placeholder="Tìm theo mã hoặc tên..."
            value={q}
            onChange={(event) => {
              setQ(event.target.value)
              setPage(1)
            }}
            onBlur={onBlur}
          />
          <Magnifier className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="overflow-x-auto rounded-md border border-border/50 bg-card">
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
                  icon={BoxMinimalistic}
                  colSpan={columns.length}
                  title={
                    query.isPending ? "Đang tải..." : "Không tìm thấy kết quả"
                  }
                  description={
                    query.isPending
                      ? undefined
                      : "Thử một từ khoá khác hoặc kiểm tra lại chính tả."
                  }
                />
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "h-14 cursor-pointer border-l-2 border-l-transparent bg-card hover:bg-muted/25",
                      row.original.id === value &&
                        "border-l-primary bg-primary/5"
                    )}
                    onClick={() => handleSelectRow(row.original)}
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

        {selectedLabel ? (
          <Badge className="gap-1.5 bg-primary/10 py-1.5 text-primary">
            <CircleCheck className="size-3.5" />
            <span className="font-mono">{selectedLabel.code}</span>
            <span className="font-normal">
              {selectedLabel.name} · {selectedLabel.unit}
            </span>
          </Badge>
        ) : null}

        {pagination ? (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Trang {pagination.currentPage}/{pagination.totalPages} —{" "}
              {pagination.totalRecords} kết quả
            </span>
            <div className="flex items-center gap-2">
              <Select
                value={String(limit)}
                onValueChange={(next) => {
                  setLimit(Number(next) as (typeof limitOptions)[number])
                  setPage(1)
                }}
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
                disabled={pagination.currentPage <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                <AltArrowLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                <AltArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {errors ? <FieldError errors={errors} /> : null}
    </Field>
  )
}
