import { useField } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"

import { departmentQueryOptions } from "@/features/departments/api"
import { createInventoryRequisitionFormDefaultValues } from "@/features/inventory-requisitions/schemas/create-inventory-requisition.schema"
import { withForm } from "@/hooks/use-app-form"
import { InventoryRequisitionType } from "@/lib/types/inventory-requisition.type"
import { buildSelectOptions } from "@/lib/utils"

// Cụm field header của bước ③ — tách khỏi CreateInventoryRequisitionForm.tsx khi file đó vượt
// ~150 dòng, cùng cách PurchaseRequestCreateHeaderSection.tsx tách khỏi
// PurchaseRequestCreateForm.tsx. "Lý do" chỉ hiện khi type=OTHER (backend: reason chỉ dùng cho
// luồng này).
export const CreateInventoryRequisitionInfoSection = withForm({
  defaultValues: createInventoryRequisitionFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const type = useField({ form, name: "type" }).state.value
    const { data: departments = [] } = useQuery(departmentQueryOptions())

    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            ③ Số lượng & thông tin phiếu
          </h2>
          <p className="text-sm text-muted-foreground">
            Mã phiếu sẽ được cấp sau khi lưu. Phiếu luôn được tạo ở trạng thái
            Nháp.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <form.AppField name="requisitionDate">
            {(field) => (
              <field.DateField label="Ngày lãnh" required disabled={disabled} />
            )}
          </form.AppField>

          <form.AppField name="departmentId">
            {(field) => (
              <field.SelectField
                label="Bộ phận"
                placeholder="Chọn bộ phận"
                options={buildSelectOptions(departments)}
                disabled={disabled}
              />
            )}
          </form.AppField>

          {type === InventoryRequisitionType.OTHER && (
            <form.AppField name="reason">
              {(field) => (
                <field.TextareaField
                  label="Lý do lãnh"
                  placeholder="Lý do lãnh vật tư"
                  disabled={disabled}
                  className="sm:col-span-2"
                />
              )}
            </form.AppField>
          )}

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú"
                placeholder="Ghi chú hiển thị trên phiếu"
                disabled={disabled}
                className="sm:col-span-2"
              />
            )}
          </form.AppField>
        </div>
      </div>
    )
  },
})
