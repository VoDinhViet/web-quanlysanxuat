import { useMemo } from "react"
import { useField } from "@tanstack/react-form"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buildQuotationSuppliersItemColumns } from "@/features/purchase-quotations/components/create/CreateQuotationSuppliersItemColumns"
import { QuotationCompareItemRow } from "@/features/purchase-quotations/components/create/QuotationCompareItemRow"
import { createQuotationFormDefaultValues } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import { withForm } from "@/hooks/use-app-form"

export const CreateQuotationSuppliersSection = withForm({
  defaultValues: createQuotationFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const columns = useMemo(
      () => buildQuotationSuppliersItemColumns({ itemsField, disabled }),
      [itemsField, disabled]
    )

    const table = useReactTable({
      data: items,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })

    return (
      <div className="px-4 py-5 sm:px-5">
        <h2 className="font-heading text-base font-semibold text-foreground">
          Khai báo NCC & báo giá
        </h2>
        <p className="text-sm text-muted-foreground">
          Mỗi vật tư tự chọn NCC riêng — một vật tư có thể hỏi nhiều NCC để so
          sánh giá
        </p>
        <p className="text-[11px] text-muted-foreground/75 italic">
          Giá gần nhất, ngày mua gần nhất và lý do điều chỉnh SL chỉ để tham
          khảo — không được lưu khi tạo RFQ
        </p>

        <div className="mt-4 overflow-hidden rounded-md border border-border/50 bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="h-11 hover:bg-muted/45"
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
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <QuotationCompareItemRow
                  key={row.original.purchaseRequestItemId}
                  row={row}
                  itemsField={itemsField}
                  disabled={disabled}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  },
})
