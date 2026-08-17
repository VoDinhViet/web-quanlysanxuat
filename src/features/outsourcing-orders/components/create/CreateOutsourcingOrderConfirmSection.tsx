import { useField } from "@tanstack/react-form"
import { DateTime } from "luxon"

import { useGetSupplierOptions } from "@/features/suppliers/api"
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
}

function PreviewField({ label, value }: PreviewFieldProps) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

// Bước ③ — xem lại toàn bộ phiếu trước khi tạo. `sendDate`/`expectedReturnDate` là chuỗi
// yyyy-MM-dd từ date picker — bắt buộc `{zone:"utc"}` khi parse, nếu không sẽ lệch 1 ngày ở múi
// giờ +07:00 (xem project_luxon_date_utc_bug).
export const CreateOutsourcingOrderConfirmSection = withForm({
  defaultValues: createOutsourcingOrderFormDefaultValues,
  props: {},
  render: function Render({ form }) {
    const supplier = useGetSupplierOptions()
    const supplierId = useField({ form, name: "supplierId" }).state.value
    const sendDate = useField({ form, name: "sendDate" }).state.value
    const expectedReturnDate = useField({
      form,
      name: "expectedReturnDate",
    }).state.value
    const items = useField({ form, name: "items" }).state.value

    const selectedSupplier = supplier.suppliers.find((s) => s.id === supplierId)
    const operationNames = Array.from(
      new Set(items.map((item) => item.operationName))
    ).join(", ")
    const { totalQuantity, totalWeight, totalArea } =
      sumOutsourcingOrderItemTotals(items)
    const today = DateTime.now().toFormat("dd/MM/yyyy HH:mm")

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            ③ Xác nhận & tạo phiếu
          </h2>
          <p className="text-sm text-muted-foreground">
            Kiểm tra lại thông tin phiếu trước khi tạo.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 rounded-md border border-dashed border-border/50 bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          <PreviewField
            label="Nhà cung cấp"
            value={selectedSupplier?.name ?? "—"}
          />
          <PreviewField
            label="Công đoạn gia công"
            value={operationNames || "—"}
          />
          <PreviewField label="Ngày lập" value={today} />
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
          <PreviewField label="Số dòng" value={String(items.length)} />
          <PreviewField
            label="Tổng SL gửi"
            value={quantityFormatter.format(totalQuantity)}
          />
          <PreviewField
            label="Tổng trọng lượng"
            value={`${decimalFormatter.format(totalWeight)} kg`}
          />
          <PreviewField
            label="Tổng diện tích"
            value={`${decimalFormatter.format(totalArea)} m²`}
          />
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-border/50 bg-card">
          <table className="w-full min-w-[720px] text-xs">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-2 text-left">Chi tiết</th>
                <th className="p-2 text-left">Công đoạn</th>
                <th className="p-2 text-right">SL gửi</th>
                <th className="p-2 text-right">Trọng lượng (kg)</th>
                <th className="p-2 text-right">Diện tích (m²)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((item) => (
                <tr key={item.operationId}>
                  <td className="p-2">
                    <p className="font-medium text-foreground">
                      {item.itemName}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {item.itemCode}
                    </p>
                  </td>
                  <td className="p-2 text-muted-foreground">
                    {item.operationName}
                  </td>
                  <td className="p-2 text-right tabular-nums">
                    {item.quantity} {item.unitName}
                  </td>
                  <td className="p-2 text-right tabular-nums">
                    {item.weight || "—"}
                  </td>
                  <td className="p-2 text-right tabular-nums">
                    {item.area || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Phiếu sẽ ở trạng thái{" "}
          <strong className="font-medium text-foreground">Đang gia công</strong>{" "}
          sau khi tạo.
        </p>
      </div>
    )
  },
})
