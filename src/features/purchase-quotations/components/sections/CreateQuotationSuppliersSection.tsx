import { Fragment, useMemo, useState } from "react"
import { useField } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { appTableFeatures } from "@/lib/table-features"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { purchaseQuotationLastPurchasesQueryOptions } from "@/features/purchase-quotations/api/options"
import { QuotationAddSupplierInlineRow } from "@/features/purchase-quotations/components/composites/QuotationAddSupplierInlineRow"
import { QuotationAdjustmentReasonRow } from "@/features/purchase-quotations/components/composites/QuotationAdjustmentReasonRow"
import { buildQuotationItemsListColumns } from "@/features/purchase-quotations/components/composites/QuotationItemsListColumns"
import { QuotationSupplierTreeRow } from "@/features/purchase-quotations/components/composites/QuotationSupplierTreeRow"
import { getQuotationItemStatus } from "@/features/purchase-quotations/constants/quotation-item-status"
import { createQuotationFormDefaultValues } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import { withForm } from "@/hooks/use-app-form"
import { cn } from "@/lib/utils"
import type { PurchaseQuotationLastPurchase } from "@/lib/types/purchase-quotation.type"

// `lastPurchases` đã sắp mới nhất trước: ưu tiên lần mua với chính NCC, không có thì lần mới nhất.
function findLastPurchase(
  lastPurchases: PurchaseQuotationLastPurchase[],
  itemId: string,
  supplierId: string
) {
  const ofItem = lastPurchases.filter((purchase) => purchase.itemId === itemId)
  return (
    ofItem.find((purchase) => purchase.supplier.id === supplierId) ?? ofItem[0]
  )
}

export const CreateQuotationSuppliersSection = withForm({
  defaultValues: createQuotationFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    // Giá mua gần nhất của mọi vật tư trong cây, tra một lần (mới nhất trước) — mỗi dòng NCC lấy
    // lần mua với chính NCC đó, không có thì lần mua gần nhất của vật tư với NCC khác.
    const { data: lastPurchases = [] } = useQuery(
      purchaseQuotationLastPurchasesQueryOptions(
        items.map((item) => item.itemId)
      )
    )

    // Tree rows start expanded; only the ones the user folds are tracked.
    const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(
      () => new Set()
    )

    const columns = useMemo(
      () =>
        buildQuotationItemsListColumns({
          itemsField,
          disabled,
          collapsedIds,
          onToggleItem: (itemId) =>
            setCollapsedIds((previous) => {
              const next = new Set(previous)
              if (!next.delete(itemId)) next.add(itemId)
              return next
            }),
        }),
      [itemsField, disabled, collapsedIds]
    )

    const table = useTable({
      data: items,
      columns,
      features: appTableFeatures,
    })

    const suppliedCount = items.filter(
      (item) => item.suppliers.length > 0
    ).length
    const isComplete = items.length > 0 && suppliedCount === items.length

    return (
      <div className="px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Khai báo NCC & báo giá
            </h2>
            <p className="text-sm text-muted-foreground">
              Mỗi vật tư có các nhà cung cấp ngay bên dưới — chọn NCC ở dòng
              cuối rồi nhập giá báo, leadtime tại chỗ. Giá gần nhất được hệ
              thống tự động hiển thị từ lịch sử mua hàng.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                isComplete
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              )}
            >
              {suppliedCount}/{items.length} vật tư đã có NCC
            </span>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-border/40">
          <Table aria-label="Danh sách vật tư và nhà cung cấp báo giá">
            <TableHeader className="bg-transparent [&>tr]:h-12 [&>tr]:hover:bg-transparent">
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
                      title="Chưa chọn vật tư nào"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const item = row.original
                  const itemIndex = row.index
                  const status = getQuotationItemStatus(item)
                  const isExpanded = !collapsedIds.has(item.itemId)

                  return (
                    <Fragment key={item.itemId}>
                      <TableRow className="h-14 bg-card hover:bg-card">
                        {row.getVisibleCells().map((cell) => {
                          const columnId = cell.column.id
                          // The NCC summary spans the price/leadtime/note/files columns.
                          if (
                            columnId === "leadTime" ||
                            columnId === "note" ||
                            columnId === "files"
                          ) {
                            return null
                          }
                          return (
                            <TableCell
                              key={cell.id}
                              colSpan={columnId === "unitPrice" ? 4 : undefined}
                              className={cn(
                                cell.column.columnDef.meta?.cellClassName,
                                columnId === "unitPrice" && "text-left"
                              )}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>

                      {isExpanded && status.isAdjusted && status.allocation && (
                        <QuotationAdjustmentReasonRow
                          itemIndex={itemIndex}
                          reason={status.allocation.quantityAdjustmentReason}
                          isOver={status.isOver}
                          needsReason={status.needsReason}
                          disabled={disabled}
                          onChange={(reason) => {
                            const allocation = status.allocation
                            if (!allocation) return
                            itemsField.replaceValue(itemIndex, {
                              ...item,
                              allocations: [
                                {
                                  ...allocation,
                                  quantityAdjustmentReason: reason,
                                },
                              ],
                            })
                          }}
                        />
                      )}

                      {isExpanded &&
                        item.suppliers.map((supplier, supplierIndex) => (
                          <QuotationSupplierTreeRow
                            key={supplier.supplierId}
                            supplier={supplier}
                            lastPurchase={findLastPurchase(
                              lastPurchases,
                              item.itemId,
                              supplier.supplierId
                            )}
                            disabled={disabled}
                            onChange={(patch) =>
                              itemsField.replaceValue(itemIndex, {
                                ...item,
                                suppliers: item.suppliers.map(
                                  (current, index) =>
                                    index === supplierIndex
                                      ? { ...current, ...patch }
                                      : current
                                ),
                              })
                            }
                            onRemove={() =>
                              itemsField.replaceValue(itemIndex, {
                                ...item,
                                suppliers: item.suppliers.filter(
                                  (_, index) => index !== supplierIndex
                                ),
                              })
                            }
                          />
                        ))}

                      {isExpanded && (
                        <QuotationAddSupplierInlineRow
                          // Remount after each add so the combobox clears its typed/picked text.
                          key={`add-${item.suppliers.length}`}
                          itemIndex={itemIndex}
                          assignedSupplierIds={
                            new Set(item.suppliers.map((s) => s.supplierId))
                          }
                          hasSuppliers={item.suppliers.length > 0}
                          disabled={disabled}
                          onAdd={(supplier) =>
                            itemsField.replaceValue(itemIndex, {
                              ...item,
                              suppliers: [...item.suppliers, supplier],
                            })
                          }
                        />
                      )}
                    </Fragment>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <form.AppField name="note">
          {(field) => (
            <field.TextareaField
              label="Ghi chú chung"
              placeholder="Ghi chú cho cả phiếu báo giá (nếu có)"
              disabled={disabled}
              className="mt-4"
            />
          )}
        </form.AppField>
      </div>
    )
  },
})
