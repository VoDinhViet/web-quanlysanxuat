import { useField, useSelector } from "@tanstack/react-form"
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
import { useGetSupplierOptions } from "@/features/suppliers/api"
import { createOutsourcingOrderConfirmColumns } from "@/features/outsourcing-orders/components/create/CreateOutsourcingOrderConfirmColumns"
import { sumOutsourcingOrderItemTotals } from "@/features/outsourcing-orders/outsourcing-order-item-totals"
import { createOutsourcingOrderFormDefaultValues } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"
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

// Bước ③ — xem lại toàn bộ phiếu trước khi tạo, trình bày như một chứng từ hoàn chỉnh (header
// phiếu → lưới thông tin → dải số liệu → bảng chi tiết có dòng tổng), khớp aesthetic "phiếu kho"
// của các trang confirm khác (InventoryReceiptCreateFromPoConfirmSection.tsx). `sendDate`/
// `expectedReturnDate` là chuỗi yyyy-MM-dd từ date picker — bắt buộc `{zone:"utc"}` khi parse,
// nếu không sẽ lệch 1 ngày ở múi giờ +07:00 (xem project_luxon_date_utc_bug). Không dùng
// `OutsourcingOrderStatusBadge` cho badge "Nháp": enum FE (`OutsourcingOrderStatus`) suy từ mock
// của trang list, chưa có state DRAFT — badge tĩnh ở đây tránh phải sửa enum đó ngoài phạm vi.
// Bảng chi tiết dùng column defs riêng (CreateOutsourcingOrderConfirmColumns.tsx), tự dựng bằng
// useReactTable như mọi bảng khác trong repo (không có khung bảng dùng chung) — và cần
// `<TableFooter>` cho dòng "Tổng", nên không thể tái dùng nguyên si component table của bước khác.
export const CreateOutsourcingOrderConfirmSection = withForm({
  defaultValues: createOutsourcingOrderFormDefaultValues,
  props: {},
  render: function Render({ form }) {
    const supplier = useGetSupplierOptions()

    // Cả 5 field chỉ dùng để hiển thị lại trên lưới thông tin phiếu bên dưới — gộp 1 lệnh
    // `useSelector` thay vì 5 lần `useField` riêng, cùng khuyến nghị "several field values at
    // once" ở forms-and-ui.md. Selector để thẳng inline — `useSelector` không tự suy được kiểu
    // `state` từ `form.store` (TSource resolve thất bại qua generic), nên vẫn cần khai tay
    // `typeof form.state` ngay tại param thay vì để trống.
    const { supplierId, sendDate, expectedReturnDate, note } = useSelector(
      form.store,
      (state) => state.values
    )
    // `items` tách riêng (useField), vì nó còn cấp data cho useReactTable ngay dưới đây — xem lý
    // do ở CreateOutsourcingOrderPickerSection.tsx.
    const items = useField({ form, name: "items" }).state.value

    const selectedSupplier = supplier.suppliers.find((s) => s.id === supplierId)
    const operationNames = Array.from(
      new Set(items.map((item) => item.operation.name))
    ).join(", ")
    const { totalQuantity, totalWeight, totalArea } =
      sumOutsourcingOrderItemTotals(items)
    const today = DateTime.now().toFormat("dd/MM/yyyy HH:mm")

    const table = useReactTable({
      data: items,
      columns: createOutsourcingOrderConfirmColumns,
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
                  Phiếu xuất đi gia công ngoài (OS-OUT)
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
            <PreviewField
              label="Nhà cung cấp gia công"
              value={
                selectedSupplier
                  ? `${selectedSupplier.name} (${selectedSupplier.code})`
                  : "—"
              }
            />
            <PreviewField
              label="Ngày gửi đi"
              value={
                sendDate
                  ? DateTime.fromISO(sendDate, { zone: "utc" }).toFormat(
                      "dd/MM/yyyy"
                    )
                  : "—"
              }
            />
            <PreviewField
              label="Ngày cần nhận về"
              value={
                expectedReturnDate
                  ? DateTime.fromISO(expectedReturnDate, {
                      zone: "utc",
                    }).toFormat("dd/MM/yyyy")
                  : "—"
              }
            />
            <PreviewField
              label="Công đoạn gia công"
              value={operationNames || "—"}
              className="sm:col-span-2 lg:col-span-4"
            />
            <PreviewField
              label="Ghi chú phiếu"
              value={note || "—"}
              className="sm:col-span-2 lg:col-span-4"
            />
          </div>

          <div className="grid grid-cols-2 divide-x divide-border/50 border-y border-border/50 bg-muted/20 sm:grid-cols-4">
            {[
              { label: "Số dòng", value: String(items.length) },
              {
                label: "Tổng SL gửi",
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
                      key={row.original.productionJobOperationId}
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

        <div className="mt-4 rounded-md bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">
            Phiếu sẽ ở trạng thái{" "}
            <strong className="font-medium text-foreground">Nháp</strong> sau
            khi tạo, chưa trừ tồn kho. Bấm "Xác nhận đã gửi" trên phiếu để trừ
            kho — khi còn Nháp, phiếu vẫn sửa/xoá được.
          </p>
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
                Còn thông tin chưa hợp lệ — quay lại bước ② để sửa (SL gửi vượt
                mức cho phép, hoặc ngày nhận trước ngày gửi).
              </div>
            )
          }
        </form.Subscribe>
      </div>
    )
  },
})
