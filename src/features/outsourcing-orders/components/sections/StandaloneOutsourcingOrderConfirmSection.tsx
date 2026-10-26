import { useSelector } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { DateTime } from "luxon"
import { FileText } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { useGetOperationOptions } from "@/features/operations/api"
import { StandaloneOutsourcingOrderConfirmItemsTable } from "@/features/outsourcing-orders/components/composites/StandaloneOutsourcingOrderConfirmItemsTable"
import { sumOutsourcingOrderItemTotals } from "@/features/outsourcing-orders/constants/outsourcing-order-item-totals"
import { standaloneOutsourcingOrderFormDefaultValues } from "@/features/outsourcing-orders/schemas/standalone-outsourcing-order.schema"
import { useGetSupplierOptions } from "@/features/suppliers/api"
import { unitOptionsQueryOptions } from "@/features/units/api"
import { withForm } from "@/hooks/use-app-form"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const decimalFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
})

// Giá trị date picker là yyyy-MM-dd: parse theo UTC để không lệch 1 ngày ở múi giờ +07:00.
function formatPickerDate(value: string) {
  return value
    ? DateTime.fromISO(value, { zone: "utc" }).toFormat("dd/MM/yyyy")
    : "—"
}

type PreviewFieldProps = {
  label: string
  value: string
  className?: string
}

function PreviewField({ label, value, className }: PreviewFieldProps) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

// Bước ③: xem lại phiếu như một chứng từ trước khi lưu, cùng bố cục bước xác nhận của luồng từ Job.
export const StandaloneOutsourcingOrderConfirmSection = withForm({
  defaultValues: standaloneOutsourcingOrderFormDefaultValues,
  props: {},
  render: function Render({ form }) {
    const { suppliers } = useGetSupplierOptions()
    const operationPicker = useGetOperationOptions()
    const { data: units = [] } = useQuery(unitOptionsQueryOptions())
    const {
      supplierId,
      operationId,
      sendDate,
      expectedReturnDate,
      note,
      items,
    } = useSelector(form.store, (state) => state.values)

    const selectedSupplier = suppliers.find(
      (supplier) => supplier.id === supplierId
    )
    const supplierLabel = selectedSupplier
      ? `${selectedSupplier.name} (${selectedSupplier.code})`
      : "—"
    // Cùng danh sách công đoạn bước ① đã tải (không phân trang, tối đa 100 — hiện có 27 công đoạn).
    const operationLabel =
      operationPicker.options.find((option) => option.value === operationId)
        ?.label ?? "—"
    const unitNameById = new Map(units.map((unit) => [unit.id, unit.name]))
    const totals = sumOutsourcingOrderItemTotals(items)
    const itemStats = [
      { label: "Số dòng", value: String(items.length) },
      {
        label: "Tổng SL gửi",
        value: quantityFormatter.format(totals.totalQuantity),
      },
      {
        label: "Tổng trọng lượng",
        value: `${decimalFormatter.format(totals.totalWeight)} kg`,
      },
      {
        label: "Tổng diện tích",
        value: `${decimalFormatter.format(totals.totalArea)} m²`,
      },
    ]

    return (
      <div className="px-4 py-5 sm:px-5">
        <h2 className="font-heading text-base font-medium text-foreground">
          Xác nhận phiếu
        </h2>
        <p className="text-sm text-muted-foreground">
          Kiểm tra lại thông tin và hàng gửi trước khi lưu.
        </p>

        <div className="mt-4 overflow-hidden rounded-md border border-border/50">
          <div className="flex items-center justify-between gap-3 border-b border-border/50 bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Phiếu xuất đi gia công ngoài (OS-OUT) · Thủ công
                </p>
                <p className="text-xs text-muted-foreground">
                  Mã phiếu cấp tự động khi tạo
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-dashed">
              Nháp
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <PreviewField label="Nhà cung cấp gia công" value={supplierLabel} />
            <PreviewField label="Công đoạn gia công" value={operationLabel} />
            <PreviewField
              label="Ngày gửi đi"
              value={formatPickerDate(sendDate)}
            />
            <PreviewField
              label="Ngày cần nhận về"
              value={formatPickerDate(expectedReturnDate)}
            />
            <PreviewField
              label="Ghi chú phiếu"
              value={note || "—"}
              className="sm:col-span-2 lg:col-span-4"
            />
          </div>

          <div className="grid grid-cols-2 divide-x divide-border/50 border-y border-border/50 bg-muted/20 sm:grid-cols-4">
            {itemStats.map((stat) => (
              <div key={stat.label} className="px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-0.5 text-sm font-medium text-foreground tabular-nums">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <StandaloneOutsourcingOrderConfirmItemsTable
            items={items}
            unitNameById={unitNameById}
            totals={totals}
          />
        </div>

        <p className="mt-4 rounded-md bg-muted/30 p-4 text-xs text-muted-foreground">
          Phiếu lưu ở trạng thái{" "}
          <strong className="font-medium text-foreground">Nháp</strong>. Bấm
          "Gửi duyệt" ở trang chi tiết phiếu; còn Nháp hoặc bị từ chối thì vẫn
          sửa được.
        </p>
      </div>
    )
  },
})
