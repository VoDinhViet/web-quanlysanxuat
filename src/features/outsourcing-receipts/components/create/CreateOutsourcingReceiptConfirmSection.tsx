import { useField } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { DateTime } from "luxon"
import { FileText } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { createOutsourcingReceiptConfirmColumns } from "@/features/outsourcing-receipts/components/create/CreateOutsourcingReceiptConfirmColumns"
import { sumOutsourcingReceiptItemTotals } from "@/features/outsourcing-receipts/outsourcing-receipt-item-totals"
import { createOutsourcingReceiptFormDefaultValues } from "@/features/outsourcing-receipts/schemas/create-outsourcing-receipt.schema"
import { warehouseOptionsQueryOptions } from "@/features/warehouses/api"
import { withForm } from "@/hooks/use-app-form"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const decimalFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
})

type PreviewFieldProps = {
  label: string
  value: string
  className?: string
}

function PreviewField({ label, value, className }: PreviewFieldProps) {
  return (
    <div className={className}>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

// Bước ③ — xem lại toàn bộ phiếu trước khi tạo, cùng aesthetic "phiếu kho" của
// CreateOutsourcingOrderConfirmSection.tsx. NCC lấy thẳng từ dòng đã chọn (`items[0].supplierName`)
// thay vì fetch lại danh sách NCC — mọi dòng luôn cùng 1 NCC vì đã chọn cố định từ đầu bước ①
// (BE chặn khác NCC — E187), nên không cần gộp theo Set như trước.
export const CreateOutsourcingReceiptConfirmSection = withForm({
  defaultValues: createOutsourcingReceiptFormDefaultValues,
  props: {},
  render: function Render({ form }) {
    const warehouseId = useField({ form, name: "warehouseId" }).state.value
    const receiptDate = useField({ form, name: "receiptDate" }).state.value
    const requiresIqc = useField({ form, name: "requiresIqc" }).state.value
    const items = useField({ form, name: "items" }).state.value

    const { data: warehouses = [] } = useQuery(warehouseOptionsQueryOptions())
    const selectedWarehouse = warehouses.find((w) => w.id === warehouseId)
    const supplierName = items.length > 0 ? items[0].supplierName : undefined

    const { totalQuantity, totalWeight, totalArea } =
      sumOutsourcingReceiptItemTotals(items)
    const today = DateTime.now().toFormat("dd/MM/yyyy HH:mm")

    const table = useReactTable({
      data: items,
      columns: createOutsourcingReceiptConfirmColumns,
      getCoreRowModel: getCoreRowModel(),
    })

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            ③ Xác nhận & tạo phiếu
          </h2>
          <p className="text-sm text-muted-foreground">
            Kiểm tra lại toàn bộ phiếu trước khi tạo.
          </p>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-border/50 bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-border/50 bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Phiếu nhập về gia công ngoài (OS-IN)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Mã phiếu cấp tự động khi tạo · Lập {today}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-dashed">
              Nháp
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <PreviewField label="Nhà cung cấp" value={supplierName ?? "—"} />
            <PreviewField
              label="Kho nhận"
              value={selectedWarehouse?.name ?? "—"}
            />
            <PreviewField
              label="Ngày nhận"
              value={
                receiptDate
                  ? DateTime.fromISO(receiptDate, { zone: "utc" }).toFormat(
                      "dd/MM/yyyy"
                    )
                  : "—"
              }
            />
            <PreviewField
              label="Yêu cầu QC"
              value={requiresIqc ? "Có" : "Không"}
            />
          </div>

          <div className="grid grid-cols-2 divide-x divide-border/50 border-y border-border/50 bg-muted/20 sm:grid-cols-4">
            {[
              { label: "Số dòng", value: String(items.length) },
              {
                label: "Tổng SL nhận",
                value: quantityFormatter.format(totalQuantity),
              },
              {
                label: "Tổng trọng lượng",
                value: `${decimalFormatter.format(totalWeight)} kg`,
              },
              {
                label: "Tổng diện tích",
                value: `${decimalFormatter.format(totalArea)} m²`,
              },
            ].map((stat) => (
              <div key={stat.label} className="px-4 py-3 text-center">
                <p className="text-[11px] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground tabular-nums">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[860px] table-fixed">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="h-12">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={
                          header.column.columnDef.meta?.headerClassName
                        }
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
                {items.length === 0 ? (
                  <TableEmpty colSpan={9} title="Chưa có dòng nào" />
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.original.outsourcingOrderItemId}
                      className="h-14"
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
              <TableFooter>
                <TableRow className="h-12">
                  <TableCell colSpan={5} className="font-semibold">
                    Tổng
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {quantityFormatter.format(totalQuantity)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {decimalFormatter.format(totalWeight)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {decimalFormatter.format(totalArea)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) =>
            !canSubmit &&
            !isSubmitting && (
              <div className="mt-4 rounded-md bg-destructive/10 p-4 text-xs text-destructive">
                Còn thông tin chưa hợp lệ — quay lại bước ② để sửa (SL nhận vượt
                SL còn lại, hoặc chưa chọn ngày nhận).
              </div>
            )
          }
        </form.Subscribe>
      </div>
    )
  },
})
