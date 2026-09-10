import { useCallback, useMemo, useState } from "react"
import { useField } from "@tanstack/react-form"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"
import { useDebounceValue } from "usehooks-ts"
import { Magnifer } from "@solar-icons/react"

import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/shared/composites/Pagination"
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
import { buildQuotationItemsPickerColumns } from "@/features/purchase-quotations/components/composites/CreateQuotationItemsPickerColumns"
import { createQuotationFormDefaultValues } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import { withForm } from "@/hooks/use-app-form"
import { cn } from "@/lib/utils"
import { PurchaseLedgerStatus } from "@/lib/types/purchase-ledger.type"
import type {
  PickedQuotationItemValue,
  QuotationItemAllocationValue,
} from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import type { PurchaseLedgerRow } from "@/lib/types/purchase-ledger.type"
import type { PageSize } from "@/components/shared/composites/Pagination"

type QuotationPickerStatusFilter = PurchaseLedgerStatus | "ALL"

const statusFilterOptions: {
  value: QuotationPickerStatusFilter
  label: string
}[] = [
  { value: "ALL", label: "Tất cả" },
  { value: PurchaseLedgerStatus.WAITING_TO_PURCHASE, label: "Chờ mua" },
  { value: PurchaseLedgerStatus.QUOTING, label: "Đang báo giá" },
]

function buildAllocation(row: PurchaseLedgerRow): QuotationItemAllocationValue {
  const remaining = Math.max(0, row.quantity - (row.quotedQuantity ?? 0))

  return {
    purchaseRequestItemId: row.id,
    prCode: row.purchaseRequest.code,
    requestedQuantity: remaining,
    neededDate: row.neededDate,
    quantity: remaining,
    quantityAdjustmentReason: "",
  }
}

// Starts with an empty NCC list — suppliers are added per item, in
// CreateQuotationSuppliersSection, not seeded here.
function buildPickedQuotationItem(
  row: PurchaseLedgerRow
): PickedQuotationItemValue {
  return {
    itemId: row.item.id,
    itemCode: row.item.code,
    itemName: row.item.name,
    unit: row.unit.name,
    allocations: [buildAllocation(row)],
    suppliers: [],
  }
}

export const CreateQuotationItemsPickerSection = withForm({
  defaultValues: createQuotationFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState<PageSize>(10)
    const [q, setQ] = useState("")
    const [statusFilter, setStatusFilter] =
      useState<QuotationPickerStatusFilter>("ALL")
    const [debouncedQ] = useDebounceValue(q, 300)

    // `useField`, not `form.Field`'s render-prop — useReactTable/useMemo below are real hooks
    // and can only be called at the component's top level, not inside a nested render-prop
    // callback. Same field API either way (CreateOrderItemsSection.tsx uses `useField` for its
    // sibling currency/exchangeRate fields, just not for its own items array).
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    // Shows WAITING_TO_PURCHASE and QUOTING rows that still have remaining quantity to buy.
    const ledgerQuery = useQuery({
      ...purchaseLedgerQueryOptions({
        page,
        limit: pageSize,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        hasRemainingQuotation: true,
        q: debouncedQ.trim() || undefined,
      }),
      placeholderData: keepPreviousData,
    })

    // Picking a dòng ĐXMH whose itemId matches an already-picked vật tư appends a new allocation
    // to that item instead of a second item — the merge this whole feature exists for. The DB's
    // new unique (quotationId, itemId) constraint makes two items sharing an itemId unrepresentable
    // server-side, so it has to be prevented here at pick time, not left to submit-time dedup.
    const toggleRow = useCallback(
      (row: PurchaseLedgerRow) => {
        const itemIndex = items.findIndex((item) =>
          item.allocations.some(
            (allocation) => allocation.purchaseRequestItemId === row.id
          )
        )

        if (itemIndex >= 0) {
          const item = items[itemIndex]
          if (item.allocations.length > 1) {
            itemsField.replaceValue(itemIndex, {
              ...item,
              allocations: item.allocations.filter(
                (allocation) => allocation.purchaseRequestItemId !== row.id
              ),
            })
          } else {
            itemsField.removeValue(itemIndex)
          }
          return
        }

        const remaining = Math.max(
          0,
          row.quantity - (row.quotedQuantity ?? 0)
        )
        if (
          row.status === PurchaseLedgerStatus.COMPLETED ||
          remaining <= 0
        ) {
          return
        }

        const existingItemIndex = items.findIndex(
          (item) => item.itemId === row.item.id
        )
        if (existingItemIndex >= 0) {
          const item = items[existingItemIndex]
          itemsField.replaceValue(existingItemIndex, {
            ...item,
            allocations: [...item.allocations, buildAllocation(row)],
          })
        } else {
          itemsField.pushValue(buildPickedQuotationItem(row))
        }
      },
      [items, itemsField]
    )

    const rawRows = ledgerQuery.data?.data ?? []
    const rows = useMemo(
      () =>
        rawRows.filter(
          (row) =>
            row.status !== PurchaseLedgerStatus.COMPLETED &&
            row.quantity - (row.quotedQuantity ?? 0) > 0
        ),
      [rawRows]
    )
    const pagination = ledgerQuery.data?.pagination

    const pickedIds = useMemo(
      () =>
        new Set(
          items.flatMap((item) =>
            item.allocations.map(
              (allocation) => allocation.purchaseRequestItemId
            )
          )
        ),
      [items]
    )

    const columns = useMemo(
      () =>
        buildQuotationItemsPickerColumns({
          pickedIds,
          disabled,
          onToggleRow: toggleRow,
        }),
      [pickedIds, disabled, toggleRow]
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
              Chọn vật tư cần báo giá
            </h2>
            <p className="text-sm text-muted-foreground">
              Chỉ hiện các dòng đề xuất mua hàng đã duyệt
            </p>
          </div>
          <span className="text-xs font-medium text-primary">
            Đã chọn {pickedIds.size} dòng ĐXMH · {items.length} vật tư
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-sm flex-1 space-y-1.5">
            <Label
              htmlFor="quotation-picker-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
            <div className="relative">
              <Input
                id="quotation-picker-search"
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

          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-muted-foreground">
              Trạng thái
            </Label>
            <div className="inline-flex rounded-lg border border-border/60 bg-muted/50 p-0.5">
              {statusFilterOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setStatusFilter(opt.value)
                    setPage(1)
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    statusFilter === opt.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-dashed border-border/50 bg-card">
          <Table aria-label="Danh sách vật tư cần báo giá">
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
                        ledgerQuery.isPending
                          ? "Đang tải..."
                          : "Không có vật tư nào cần mua"
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="h-14 cursor-pointer bg-card hover:bg-muted/25"
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
