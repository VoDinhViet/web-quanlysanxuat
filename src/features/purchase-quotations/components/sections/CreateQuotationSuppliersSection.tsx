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
import { buildQuotationItemsColumns } from "@/features/purchase-quotations/components/composites/QuotationItemsColumns"
import { QuotationSupplierQuoteDialog } from "@/features/purchase-quotations/components/composites/QuotationSupplierQuoteDialog"
import { QuotationItemSupplierRow } from "@/features/purchase-quotations/components/composites/QuotationItemSupplierRow"
import { getQuotationItemStatus } from "@/features/purchase-quotations/constants/quotation-item-status"
import { createQuotationFormDefaultValues } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import { withForm } from "@/hooks/use-app-form"
import { cn } from "@/lib/utils"
import type { QuotationItemSupplierValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import type { PurchaseQuotationLastPurchase } from "@/lib/types/purchase-quotation.type"

// Tra cứu lần mua gần nhất của vật tư: ưu tiên lần mua với chính NCC đó, nếu chưa có thì lấy lần mua gần nhất chung.
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

    // Lịch sử giá mua gần nhất của các vật tư trong phiếu báo giá
    const { data: lastPurchases = [] } = useQuery(
      purchaseQuotationLastPurchasesQueryOptions(
        items.map((item) => item.itemId)
      )
    )

    // Trạng thái modal chi tiết báo giá NCC đang được chỉnh sửa
    const [editingQuoteTarget, setEditingQuoteTarget] = useState<{
      itemIndex: number
      supplierIndex: number
    } | null>(null)

    // Quản lý đóng / mở cây vật tư (mặc định mở tất cả)
    const [collapsedItemIds, setCollapsedItemIds] = useState<
      ReadonlySet<string>
    >(() => new Set())

    const handleToggleItem = (itemId: string) => {
      setCollapsedItemIds((previous) => {
        const next = new Set(previous)
        if (!next.delete(itemId)) next.add(itemId)
        return next
      })
    }

    // Các nghiệp vụ quản lý báo giá NCC (Business Operations)
    const updateSupplierQuote = (
      itemIndex: number,
      supplierIndex: number,
      patch: Partial<QuotationItemSupplierValue>
    ) => {
      const targetItem = items[itemIndex]
      itemsField.replaceValue(itemIndex, {
        ...targetItem,
        suppliers: targetItem.suppliers.map((quote, idx) =>
          idx === supplierIndex ? { ...quote, ...patch } : quote
        ),
      })
    }

    const removeSupplierQuote = (itemIndex: number, supplierIndex: number) => {
      const targetItem = items[itemIndex]
      itemsField.replaceValue(itemIndex, {
        ...targetItem,
        suppliers: targetItem.suppliers.filter(
          (_, idx) => idx !== supplierIndex
        ),
      })
    }

    const addSupplierQuote = (
      itemIndex: number,
      newQuote: QuotationItemSupplierValue
    ) => {
      const targetItem = items[itemIndex]
      const updatedSuppliers = [...targetItem.suppliers, newQuote]
      itemsField.replaceValue(itemIndex, {
        ...targetItem,
        suppliers: updatedSuppliers,
      })
      // Tự động mở Dialog nhập chi tiết cho NCC vừa thêm
      setEditingQuoteTarget({
        itemIndex,
        supplierIndex: updatedSuppliers.length - 1,
      })
    }

    const updateAdjustmentReason = (itemIndex: number, reason: string) => {
      const targetItem = items[itemIndex]
      const allocation = targetItem.allocations[0]
      if (!allocation) return
      itemsField.replaceValue(itemIndex, {
        ...targetItem,
        allocations: [{ ...allocation, quantityAdjustmentReason: reason }],
      })
    }

    const columns = useMemo(
      () =>
        buildQuotationItemsColumns({
          itemsField,
          disabled,
          collapsedIds: collapsedItemIds,
          onToggleItem: handleToggleItem,
        }),
      [itemsField, disabled, collapsedItemIds]
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

    // Báo giá NCC đang chỉnh sửa trong Dialog
    const editingItem = editingQuoteTarget
      ? items[editingQuoteTarget.itemIndex]
      : null
    const editingSupplier =
      editingItem?.suppliers[editingQuoteTarget?.supplierIndex ?? -1]

    return (
      <div className="px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-medium text-foreground">
              Khai báo NCC & báo giá
            </h2>
            <p className="text-sm text-muted-foreground">
              Mỗi vật tư có các nhà cung cấp ngay bên dưới — chọn NCC ở dòng
              cuối để thêm. Bạn có thể nhập nhanh giá tại bảng hoặc bấm{" "}
              <strong>&ldquo;Chi tiết&rdquo;</strong> để mở hộp thoại nhập đầy
              đủ quy cách riêng, lead time, ghi chú và tệp báo giá đính kèm.
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
            <TableHeader className="bg-muted/40 [&>tr]:h-11">
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
                  const isExpanded = !collapsedItemIds.has(item.itemId)

                  return (
                    <Fragment key={item.itemId}>
                      <TableRow className="h-14 bg-card hover:bg-card">
                        {row.getVisibleCells().map((cell) => {
                          const columnId = cell.column.id
                          // Tóm tắt tiến độ NCC trải rộng qua 4 cột (unitPrice, totalAmount, leadTime, note)
                          if (
                            columnId === "totalAmount" ||
                            columnId === "leadTime" ||
                            columnId === "note"
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
                          onChange={(reason) =>
                            updateAdjustmentReason(itemIndex, reason)
                          }
                        />
                      )}

                      {isExpanded &&
                        item.suppliers.map((supplier, supplierIndex) => (
                          <QuotationItemSupplierRow
                            key={supplier.supplierId}
                            item={item}
                            supplier={supplier}
                            lastPurchase={findLastPurchase(
                              lastPurchases,
                              item.itemId,
                              supplier.supplierId
                            )}
                            disabled={disabled}
                            onChange={(patch) =>
                              updateSupplierQuote(
                                itemIndex,
                                supplierIndex,
                                patch
                              )
                            }
                            onRemove={() =>
                              removeSupplierQuote(itemIndex, supplierIndex)
                            }
                            onOpenDetail={() =>
                              setEditingQuoteTarget({
                                itemIndex,
                                supplierIndex,
                              })
                            }
                          />
                        ))}

                      {isExpanded && (
                        <QuotationAddSupplierInlineRow
                          key={`add-${item.suppliers.length}`}
                          itemIndex={itemIndex}
                          assignedSupplierIds={
                            new Set(item.suppliers.map((s) => s.supplierId))
                          }
                          hasSuppliers={item.suppliers.length > 0}
                          disabled={disabled}
                          onAdd={(newQuote) =>
                            addSupplierQuote(itemIndex, newQuote)
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

        {/* Modal chi tiết báo giá NCC */}
        {editingItem && editingSupplier && editingQuoteTarget && (
          <QuotationSupplierQuoteDialog
            open
            onOpenChange={(open) => {
              if (!open) setEditingQuoteTarget(null)
            }}
            supplier={editingSupplier}
            item={editingItem}
            lastPurchase={findLastPurchase(
              lastPurchases,
              editingItem.itemId,
              editingSupplier.supplierId
            )}
            disabled={disabled}
            onChange={(patch) =>
              updateSupplierQuote(
                editingQuoteTarget.itemIndex,
                editingQuoteTarget.supplierIndex,
                patch
              )
            }
            onRemove={() => {
              removeSupplierQuote(
                editingQuoteTarget.itemIndex,
                editingQuoteTarget.supplierIndex
              )
              setEditingQuoteTarget(null)
            }}
          />
        )}
      </div>
    )
  },
})
