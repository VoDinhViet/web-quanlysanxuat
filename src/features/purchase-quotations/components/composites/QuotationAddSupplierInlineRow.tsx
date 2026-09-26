import { TableCell, TableRow } from "@/components/ui/table"
import { QuotationTreeGuide } from "@/features/purchase-quotations/components/composites/QuotationTreeGuide"
import { ComboboxField } from "@/components/shared/composites/ComboboxField"
import { useGetSupplierOptions } from "@/features/suppliers/api"
import type { QuotationItemSupplierValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

type QuotationAddSupplierInlineRowProps = {
  itemIndex: number
  assignedSupplierIds: ReadonlySet<string>
  disabled?: boolean
  hasSuppliers: boolean
  onAdd: (supplier: QuotationItemSupplierValue) => void
}

// Last child row of a vật tư: pick an NCC right in the table — it is appended immediately as a
// new child row (price/leadtime/note then edit inline). `value` stays undefined so the combobox
// resets after every pick; NCC already on this vật tư are filtered out of the options.
export function QuotationAddSupplierInlineRow({
  itemIndex,
  assignedSupplierIds,
  disabled,
  hasSuppliers,
  onAdd,
}: QuotationAddSupplierInlineRowProps) {
  const { suppliers, options, isFetching, onSearchChange } =
    useGetSupplierOptions()

  const availableOptions = options.filter(
    (option) => !assignedSupplierIds.has(option.value)
  )

  return (
    <TableRow className="h-12 bg-card hover:bg-card">
      <QuotationTreeGuide isLast />
      <TableCell colSpan={9}>
        <div className="max-w-md">
          <div className="min-w-0 flex-1">
            <ComboboxField
              id={`quotation-add-supplier-${itemIndex}`}
              placeholder={
                hasSuppliers
                  ? "+ Thêm nhà cung cấp khác (gõ mã hoặc tên)..."
                  : "+ Thêm nhà cung cấp đầu tiên (gõ mã hoặc tên)..."
              }
              value={undefined}
              disabled={disabled}
              onValueChange={(supplierId) => {
                const supplier = suppliers.find((s) => s.id === supplierId)
                if (!supplier) return
                onAdd({
                  supplierId: supplier.id,
                  supplierLabel: supplier.name,
                  lastPrice: undefined,
                  lastPurchaseDate: "",
                  unitPrice: undefined,
                  leadTimeDays: undefined,
                  note: "",
                })
              }}
              options={availableOptions}
              onSearchChange={onSearchChange}
              isPending={isFetching}
              emptyMessage="Không tìm thấy NCC"
            />
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}
