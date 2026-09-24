import { DateTime } from "luxon"

import { UpdateOrderTotalsSummary } from "@/features/orders/components/composites/UpdateOrderTotalsSummary"
import { UploadOrderDocuments } from "@/features/orders/components/composites/UploadOrderDocuments"
import { updateOrderFormDefaultValues } from "@/features/orders/schemas/update-order.schema"
import { withForm } from "@/hooks/use-app-form"
import { paymentTermShortLabels } from "@/lib/types/payment-term.type"

type RecapFieldProps = {
  label: string
  value: string
}

function RecapField({ label, value }: RecapFieldProps) {
  return (
    <div>
      <span className="block text-[11px] text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

// Bước ④ của wizard: nhắc lại vài mốc chính đã chọn ở ①/②/③ (không lặp lại toàn bộ form —
// người dùng chỉ 1 cú bấm tab để quay lại sửa), tài liệu đính kèm, rồi tới phần chiết khấu/VAT/
// phí VC + tổng tiền (UpdateOrderTotalsSummary.tsx). Cùng khuôn CreateOrderConfirmSection.tsx
// (TanStack Form).
export const UpdateOrderConfirmSection = withForm({
  defaultValues: updateOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    return (
      <div>
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold tracking-wide text-foreground uppercase">
            Xác nhận & tổng tiền
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Kiểm tra lại thông tin trước khi lưu thay đổi
          </p>
        </div>

        <form.Subscribe
          selector={(state) => ({
            items: state.values.items,
            orderDate: state.values.orderDate,
            dueDate: state.values.dueDate,
            paymentTerm: state.values.paymentTerm,
          })}
        >
          {({ items, orderDate, dueDate, paymentTerm }) => (
            <div className="grid grid-cols-2 gap-4 px-4 py-5 sm:grid-cols-4 sm:px-5">
              <RecapField
                label="Ngày đặt hàng"
                value={
                  orderDate
                    ? DateTime.fromISO(orderDate).toFormat("dd/MM/yyyy")
                    : "—"
                }
              />
              <RecapField
                label="Ngày giao hàng yêu cầu"
                value={
                  dueDate
                    ? DateTime.fromISO(dueDate).toFormat("dd/MM/yyyy")
                    : "—"
                }
              />
              <RecapField
                label="Điều khoản thanh toán"
                value={paymentTerm ? paymentTermShortLabels[paymentTerm] : "—"}
              />
              <RecapField label="Sản phẩm" value={`${items.length} sản phẩm`} />
            </div>
          )}
        </form.Subscribe>

        <div className="border-t border-border px-4 py-5 sm:px-5">
          <form.Field name="files">
            {(field) => (
              <UploadOrderDocuments
                value={field.state.value}
                onChange={field.handleChange}
                disabled={disabled}
              />
            )}
          </form.Field>
        </div>

        <div className="border-t border-border px-4 py-5 sm:px-5">
          <UpdateOrderTotalsSummary form={form} disabled={disabled} />
        </div>
      </div>
    )
  },
})
