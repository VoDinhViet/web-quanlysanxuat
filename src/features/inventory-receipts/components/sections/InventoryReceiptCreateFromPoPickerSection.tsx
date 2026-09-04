import { useState } from "react"
import { useField } from "@tanstack/react-form"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { useDebounceValue } from "usehooks-ts"
import { AltArrowLeft, AltArrowRight, Magnifer } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup } from "@/components/ui/radio-group"
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
import { buildInventoryReceiptFromPoPickerColumns } from "@/features/inventory-receipts/components/composites/InventoryReceiptCreateFromPoPickerColumns"
import { createInventoryReceiptFromPoFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt-from-po.schema"
import { purchaseOrdersQueryOptions } from "@/features/purchase-orders/api"
import { withForm } from "@/hooks/use-app-form"
import { cn } from "@/lib/utils"

const limitOptions = [10, 20, 50] as const
const columns = buildInventoryReceiptFromPoPickerColumns()

// Bước ① của wizard — chọn đúng 1 PO đã ORDERED và còn hàng chưa nhận đủ
// (`hasRemainingReceipt: true`, xem purchase-orders-search.schema.ts). Rập khuôn
// CreateQuotationItemsPickerSection.tsx (page/limit/q + debounce, bảng useReactTable riêng), chỉ
// khác select là radio (1 PO) thay vì checkbox (nhiều dòng).
export const InventoryReceiptCreateFromPoPickerSection = withForm({
  defaultValues: createInventoryReceiptFromPoFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState<(typeof limitOptions)[number]>(10)
    const [q, setQ] = useState("")
    const [debouncedQ] = useDebounceValue(q, 300)

    const purchaseOrderIdField = useField({ form, name: "purchaseOrderId" })

    const poQuery = useQuery({
      ...purchaseOrdersQueryOptions({
        page,
        limit,
        q: debouncedQ.trim() || undefined,
        hasRemainingReceipt: true,
      }),
      placeholderData: keepPreviousData,
    })

    const rows = poQuery.data?.data ?? []
    const pagination = poQuery.data?.pagination

    const reactTable = useTable({
      data: rows,
      columns,
      features: appTableFeatures,
    })

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            ① Chọn PO cần nhập
          </h2>
          <p className="text-sm text-muted-foreground">
            Chỉ hiện các PO đã đặt hàng và còn vật tư chưa nhập kho.
          </p>
        </div>

        <div className="mt-4 max-w-sm space-y-1.5">
          <Label
            htmlFor="receipt-from-po-search"
            className="text-[11px] font-medium text-muted-foreground"
          >
            Tìm kiếm
          </Label>
          <div className="relative">
            <Input
              id="receipt-from-po-search"
              className="pr-9 text-xs placeholder:text-muted-foreground/75"
              placeholder="Tìm theo mã PO, nhà cung cấp..."
              value={q}
              disabled={disabled}
              onChange={(event) => {
                setQ(event.target.value)
                setPage(1)
              }}
            />
            <Magnifer className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <RadioGroup
          value={purchaseOrderIdField.state.value}
          onChange={(value) => purchaseOrderIdField.handleChange(value)}
          className="mt-4 block gap-0 overflow-hidden rounded-md border border-dashed border-border/50 bg-card"
        >
          <Table aria-label="Danh sách PO cần nhập">
            <TableHeader
              columns={reactTable.getFlatHeaders()}
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
              items={reactTable.getRowModel().rows}
              className={cn(
                poQuery.isFetching && "pointer-events-none opacity-50"
              )}
              renderEmptyState={() => (
                <TableEmpty
                  colSpan={columns.length}
                  title={
                    poQuery.isPending
                      ? "Đang tải..."
                      : "Không có PO nào cần nhập kho"
                  }
                />
              )}
            >
              {(row) => (
                <TableRow
                  id={row.id}
                  className="h-14 cursor-pointer bg-card hover:bg-muted/25"
                  onAction={() =>
                    !disabled &&
                    purchaseOrderIdField.handleChange(row.original.id)
                  }
                  columns={row.getVisibleCells()}
                >
                  {(cell) => (
                    <TableCell
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
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </RadioGroup>

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
                <AltArrowLeft className="size-4" />
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
                <AltArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  },
})
