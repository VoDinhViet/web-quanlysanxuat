import { useMemo } from "react"

import { updateOutboundOrderFormDefaultValues } from "@/features/outbound-orders/schemas/update-outbound-order.schema"
import { withForm } from "@/hooks/use-app-form"
import { fulfillmentTypeLabels } from "@/lib/types/outbound-order.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { OutboundOrderItem } from "@/lib/types/outbound-order.type"

const fulfillmentTypeOptions = buildOptionsFromLabels(fulfillmentTypeLabels)

// 7 field sửa được (BUG-090, mở rộng theo UI Spec): Ngày giao/Hình thức giao/Ghi chú (đã có từ bản
// gốc) + Địa chỉ giao hàng/Người nhận/Điện thoại/Phương tiện (mới). Khách hàng không sửa được (bất
// biến "1 phiếu = 1 khách hàng") — hiện text tĩnh; "PO / Lý do" cũng đọc-only, tự suy từ các mã PO
// nguồn của items (không phải field BE riêng).
export const OutboundOrderEditHeaderSection = withForm({
  defaultValues: updateOutboundOrderFormDefaultValues,
  props: { disabled: false, clientName: "", items: [] as OutboundOrderItem[] },
  render: function Render({ form, disabled, clientName, items }) {
    const orderCodes = useMemo(
      () => [...new Set(items.map((item) => item.order.code))].join(", "),
      [items]
    )

    return (
      <div className="px-4 py-5 sm:px-5">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Khách hàng
            </p>
            <p className="mt-1.5 text-sm font-medium text-foreground">
              {clientName}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">
              PO / Lý do
            </p>
            <p className="mt-1.5 truncate text-sm text-foreground">
              {orderCodes || "—"}
            </p>
          </div>

          <form.AppField name="deliveryAddress">
            {(field) => (
              <field.TextareaField
                label="Địa chỉ giao hàng"
                placeholder="Địa chỉ giao hàng (nếu có)"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="fulfillmentType">
            {(field) => (
              <field.SelectField
                label="Hình thức giao"
                required
                placeholder="Chọn hình thức giao"
                options={fulfillmentTypeOptions}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="receiverName">
            {(field) => (
              <field.TextField
                label="Người nhận"
                placeholder="Tên người nhận (nếu có)"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="fulfillmentDate">
            {(field) => (
              <field.DateField label="Ngày giao" required disabled={disabled} />
            )}
          </form.AppField>

          <form.AppField name="receiverPhone">
            {(field) => (
              <field.TextField
                label="Điện thoại"
                placeholder="Điện thoại người nhận (nếu có)"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="vehicle">
            {(field) => (
              <field.TextField
                label="Phương tiện"
                placeholder="Phương tiện (nếu có)"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú"
                placeholder="Ghi chú hiển thị trên phiếu (nếu có)"
                disabled={disabled}
              />
            )}
          </form.AppField>
        </div>
      </div>
    )
  },
})
