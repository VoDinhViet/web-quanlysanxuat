import { useCallback, useMemo, useState } from "react"
import { useField } from "@tanstack/react-form"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useDebounceValue } from "usehooks-ts"
import { AltArrowLeft, AltArrowRight, Magnifer } from "@solar-icons/react"

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
import { purchaseLedgerQueryOptions } from "@/features/purchase-ledger/api"
import { buildPurchaseOrderItemsPickerColumns } from "@/features/purchase-orders/components/composites/CreatePurchaseOrderItemsPickerColumns"
import { createPurchaseOrderFormDefaultValues } from "@/features/purchase-orders/schemas/create-purchase-order.schema"
import { withForm } from "@/hooks/use-app-form"
import { PurchaseLedgerStatus } from "@/lib/types/purchase-ledger.type"
import { cn } from "@/lib/utils"
import type { PickedPurchaseOrderItemValue } from "@/features/purchase-orders/schemas/create-purchase-order.schema"
import type { PurchaseLedgerRow } from "@/lib/types/purchase-ledger.type"

const limitOptions = [10, 20, 50] as const

// Each ledger row picked becomes its own PO item row directly — unlike RFQ's picker, a PO item
// maps 1:1 to a dòng ĐXMH (no allocation merge, CreatePurchaseOrderItemReqDto.purchaseRequestItemId
// is the row itself), so there's no "same item picked twice" merge case to handle here.
function buildPickedPurchaseOrderItem(
  row: PurchaseLedgerRow
): PickedPurchaseOrderItemValue {
  return {
    purchaseRequestItemId: row.id,
    itemCode: row.item.code,
    itemName: row.item.name,
    unit: row.unit.name,
    prCode: row.purchaseRequest.code,
    requestedQuantity: row.quantity,
    quantity: row.quantity,
    unitPrice: undefined,
    quantityAdjustmentReason: "",
  }
}

export const CreatePurchaseOrderItemsPickerSection = withForm({
  defaultValues: createPurchaseOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState<(typeof limitOptions)[number]>(10)
    const [q, setQ] = useState("")
    const [debouncedQ] = useDebounceValue(q, 300)

    // `useField`, not `form.Field`'s render-prop — useReactTable/useMemo below are real hooks and
    // can only be called at the component's top level, same reasoning as
    // CreateQuotationItemsPickerSection.tsx.
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    // Only WAITING_TO_PURCHASE rows have zero quotation/PO so far — same filter and reasoning as
    // the RFQ picker (CreateQuotationItemsPickerSection.tsx): QUOTING/ORDERED/COMPLETED rows
    // already have a document in progress and don't belong in this picker.
    const ledgerQuery = useQuery({
      ...purchaseLedgerQueryOptions({
        page,
        limit,
        status: PurchaseLedgerStatus.WAITING_TO_PURCHASE,
        q: debouncedQ.trim() || undefined,
      }),
      placeholderData: keepPreviousData,
    })

    const toggleRow = useCallback(
      (row: PurchaseLedgerRow) => {
        const index = items.findIndex(
          (item) => item.purchaseRequestItemId === row.id
        )

        if (index >= 0) {
          itemsField.removeValue(index)
          return
        }

        itemsField.pushValue(buildPickedPurchaseOrderItem(row))
      },
      [items, itemsField]
    )

    const rows = ledgerQuery.data?.data ?? []
    const pagination = ledgerQuery.data?.pagination

    const pickedIds = useMemo(
      () => new Set(items.map((item) => item.purchaseRequestItemId)),
      [items]
    )

    const columns = useMemo(
      () =>
        buildPurchaseOrderItemsPickerColumns({
          pickedIds,
          disabled,
          onToggleRow: toggleRow,
        }),
      [pickedIds, disabled, toggleRow]
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
              Chọn dòng đề xuất mua hàng
            </h2>
            <p className="text-sm text-muted-foreground">
              Chỉ hiện các dòng đề xuất mua hàng đã duyệt, chưa có báo giá/PO
              nào
            </p>
          </div>
          <span className="text-xs font-medium text-primary">
            Đã chọn {items.length} dòng
          </span>
        </div>

        <div className="mt-4 max-w-sm space-y-1.5">
          <Label
            htmlFor="purchase-order-picker-search"
            className="text-[11px] font-medium text-muted-foreground"
          >
            Tìm kiếm
          </Label>
          <div className="relative">
            <Input
              id="purchase-order-picker-search"
              className="pr-9 text-xs placeholder:text-muted-foreground/75"
              placeholder="Tìm theo mã PR, mã/tên vật tư..."
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
                ledgerQuery.isFetching && "pointer-events-none opacity-50"
              )}
            >
              {rows.length === 0 ? (
                <TableEmpty
                  colSpan={columns.length}
                  title={
                    ledgerQuery.isPending
                      ? "Đang tải..."
                      : "Không có vật tư nào cần mua"
                  }
                />
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="h-14 cursor-pointer bg-card hover:bg-muted/25"
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
                <AltArrowLeft className="size-4" />
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
                <AltArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  },
})
