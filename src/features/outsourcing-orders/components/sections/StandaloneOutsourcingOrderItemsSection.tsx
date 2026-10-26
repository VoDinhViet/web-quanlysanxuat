import { useMemo } from "react"
import { useField } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { flexRender, useTable } from "@tanstack/react-table"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buildStandaloneOutsourcingOrderItemColumns } from "@/features/outsourcing-orders/components/composites/StandaloneOutsourcingOrderItemsColumns"
import { sumOutsourcingOrderItemTotals } from "@/features/outsourcing-orders/constants/outsourcing-order-item-totals"
import {
  emptyStandaloneOutsourcingOrderItem,
  standaloneOutsourcingOrderFormDefaultValues,
} from "@/features/outsourcing-orders/schemas/standalone-outsourcing-order.schema"
import { unitOptionsQueryOptions } from "@/features/units/api"
import { withForm } from "@/hooks/use-app-form"
import { appTableFeatures } from "@/lib/table-features"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const decimalFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
})

// Bước ②: bảng nhập hàng gửi gia công, mỗi dòng một mã hàng người dùng tự gõ.
export const StandaloneOutsourcingOrderItemsSection = withForm({
  defaultValues: standaloneOutsourcingOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const { data: units, isPending: isUnitsPending } = useQuery(
      unitOptionsQueryOptions()
    )
    // `useField` thay vì render-prop `form.Field`: useMemo/useTable bên dưới là hook thật.
    const itemsField = useField({ form, name: "items" })
    const items = itemsField.state.value

    const columns = useMemo(
      () =>
        buildStandaloneOutsourcingOrderItemColumns({
          form,
          onRemoveItem: (itemIndex) =>
            void form.removeFieldValue("items", itemIndex),
          unitOptions: (units ?? []).map((unit) => ({
            value: unit.id,
            label: unit.name,
          })),
          isUnitsPending,
          disabled,
        }),
      [form, units, isUnitsPending, disabled]
    )
    const table = useTable({
      data: items,
      columns,
      features: appTableFeatures,
    })

    const { totalQuantity, totalWeight, totalArea } =
      sumOutsourcingOrderItemTotals(items)

    return (
      <div className="px-4 py-5 sm:px-5">
        <h2 className="font-heading text-base font-medium text-foreground">
          Hàng gửi gia công
        </h2>
        <p className="text-sm text-muted-foreground">
          Mỗi dòng là một mã hàng gửi đi, mã không được trùng trong phiếu.
        </p>

        <div className="mt-4 overflow-x-auto rounded-md border border-border/50">
          <Table
            aria-label="Danh sách hàng gửi gia công"
            className="min-w-[960px]"
          >
            <TableHeader className="[&>tr]:h-11">
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
                <TableRow key={row.id} className="h-14 hover:bg-muted/25">
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
        </div>

        <FieldError errors={itemsField.state.meta.errors} className="mt-2" />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() =>
              itemsField.pushValue(emptyStandaloneOutsourcingOrderItem)
            }
          >
            <Plus className="size-4" />
            Thêm dòng
          </Button>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>
              Số dòng:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {items.length}
              </span>
            </span>
            <span>
              Tổng SL gửi:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {quantityFormatter.format(totalQuantity)}
              </span>
            </span>
            <span>
              Tổng trọng lượng:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {decimalFormatter.format(totalWeight)} kg
              </span>
            </span>
            <span>
              Tổng diện tích:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {decimalFormatter.format(totalArea)} m²
              </span>
            </span>
          </div>
        </div>
      </div>
    )
  },
})
