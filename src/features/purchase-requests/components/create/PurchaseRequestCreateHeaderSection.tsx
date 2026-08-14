import { useQuery } from "@tanstack/react-query"

import { withForm } from "@/hooks/use-app-form"
import { departmentOptionsQueryOptions } from "@/features/departments/api"
import { createPurchaseRequestFormDefaultValues } from "@/features/purchase-requests/schemas/create-purchase-request.schema"
import { buildSelectOptions } from "@/lib/utils"

export const PurchaseRequestCreateHeaderSection = withForm({
  defaultValues: createPurchaseRequestFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    // Không loader ở route create — danh sách phòng ban là 1 useQuery nhỏ ngay trong
    // component, cùng lý do InventoryReceiptHeaderSection.tsx không prefetch kho/NCC.
    const { data: departments = [] } = useQuery(departmentOptionsQueryOptions())

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Thông tin đề xuất
          </h2>
          <p className="text-sm text-muted-foreground">
            Mã đề xuất sẽ được cấp sau khi lưu
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <form.AppField name="departmentId">
            {(field) => (
              <field.SelectField
                label="Phòng ban"
                required
                placeholder="Chọn phòng ban"
                options={buildSelectOptions(departments)}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="neededDate">
            {(field) => (
              <field.DateField
                label="Ngày cần hàng"
                required
                disabled={disabled}
              />
            )}
          </form.AppField>

          <p className="text-xs text-muted-foreground sm:col-span-2">
            Đề xuất sẽ được lưu ở trạng thái Nháp. Vào trang chi tiết để gửi
            duyệt sau khi tạo.
          </p>
        </div>
      </div>
    )
  },
})
