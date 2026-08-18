import { useMemo } from "react"
import { useField } from "@tanstack/react-form"
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
import { buildCreateOutboundOrderConfirmColumns } from "@/features/outbound-orders/components/create/CreateOutboundOrderConfirmColumns"
import { useUnfulfilledOrderItemLookup } from "@/features/outbound-orders/hooks/use-unfulfilled-order-item-lookup"
import { createOutboundOrderFormDefaultValues } from "@/features/outbound-orders/schemas/create-outbound-order.schema"
import { withForm } from "@/hooks/use-app-form"
import { fulfillmentTypeLabels } from "@/lib/types/outbound-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

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
// CreateOutsourcingReceiptConfirmSection.tsx. Khách hàng tra qua `lookupUnfulfilledOrderItem` từ
// dòng đầu tiên đã chọn (item value chỉ giữ 5 field gửi BE, không có clientName) — mọi dòng luôn
// cùng 1 khách hàng vì đã chọn cố định từ đầu bước ① (BE chặn khác khách hàng — E192).
export const CreateOutboundOrderConfirmSection = withForm({
  defaultValues: createOutboundOrderFormDefaultValues,
  props: {},
  render: function Render({ form }) {
    const fulfillmentDate = useField({
      form,
      name: "fulfillmentDate",
    }).state.value
    const fulfillmentType = useField({
      form,
      name: "fulfillmentType",
    }).state.value
    const items = useField({ form, name: "items" }).state.value
    const lookupUnfulfilledOrderItem = useUnfulfilledOrderItemLookup()

    const clientName =
      items.length > 0
        ? lookupUnfulfilledOrderItem(items[0].orderItemId)?.client.name
        : undefined

    const totalQuantity = items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    )
    const today = DateTime.now().toFormat("dd/MM/yyyy HH:mm")

    const columns = useMemo(
      () => buildCreateOutboundOrderConfirmColumns(lookupUnfulfilledOrderItem),
      [lookupUnfulfilledOrderItem]
    )

    const table = useReactTable({
      data: items,
      columns,
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
                  Phiếu giao hàng (DO)
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

          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
            <PreviewField label="Khách hàng" value={clientName ?? "—"} />
            <PreviewField
              label="Ngày giao"
              value={
                fulfillmentDate
                  ? DateTime.fromISO(fulfillmentDate, {
                      zone: "utc",
                    }).toFormat("dd/MM/yyyy")
                  : "—"
              }
            />
            <PreviewField
              label="Hình thức giao"
              value={fulfillmentTypeLabels[fulfillmentType]}
            />
          </div>

          <div className="grid grid-cols-2 divide-x divide-border/50 border-y border-border/50 bg-muted/20">
            {[
              { label: "Số dòng", value: String(items.length) },
              {
                label: "Tổng SL giao",
                value: quantityFormatter.format(totalQuantity),
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
            <Table className="min-w-[820px] table-fixed">
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
                  <TableEmpty colSpan={8} title="Chưa có dòng nào" />
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.original.orderItemId} className="h-14">
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
                  <TableCell colSpan={6} className="font-semibold">
                    Tổng
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {quantityFormatter.format(totalQuantity)}
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
                Còn thông tin chưa hợp lệ — quay lại bước ② để sửa (SL giao chưa
                hợp lệ, hoặc chưa chọn đủ ngày giao/hình thức giao).
              </div>
            )
          }
        </form.Subscribe>
      </div>
    )
  },
})
