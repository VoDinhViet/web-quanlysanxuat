import { Radio } from "@base-ui/react/radio"

import { RadioGroup } from "@/components/ui/radio-group"
import { withForm } from "@/hooks/use-app-form"
import { createInventoryReceiptOtherFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt-other.schema"

// Phần ① của làn "Nhập từ khác" — nhập kho không có PO/NCC/khách/Job: thu hồi, nhập hàng khác. Khác
// CreateInventoryReceiptReturnHeaderSection.tsx ở ô "PO / Lý do" bắt buộc thay cho combobox khách
// hàng. Kiểm kê thừa không nhập ở đây mà ở phiếu Điều chỉnh tồn.
export const CreateInventoryReceiptOtherHeaderSection = withForm({
  defaultValues: createInventoryReceiptOtherFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    return (
      <div className="px-4 py-5 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            ① Thông tin chung
          </h2>
          <p className="text-sm text-muted-foreground">
            Lý do nhập, ngày nhập và yêu cầu QC cho phiếu này.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <form.AppField name="receiptDate">
            {(field) => (
              <field.DateField label="Ngày nhập" required disabled={disabled} />
            )}
          </form.AppField>

          <form.AppField name="reason">
            {(field) => (
              <field.TextField
                label="PO / Lý do"
                required
                placeholder="Ví dụ: Trả vật tư dư từ LSX..., Thu hồi vật tư..."
                disabled={disabled}
                className="sm:col-span-2"
              />
            )}
          </form.AppField>

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú"
                placeholder="Ghi chú hiển thị trên phiếu (nếu có)"
                disabled={disabled}
                className="sm:col-span-2 lg:col-span-4"
              />
            )}
          </form.AppField>

          {/* `requiresIqc` là boolean trong form state, cùng lý do
              CreateInventoryReceiptReturnHeaderSection.tsx. */}
          <form.Field name="requiresIqc">
            {(field) => (
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
                <span className="block text-xs font-medium text-foreground">
                  Yêu cầu QC (IQC) <span className="text-destructive">*</span>
                </span>
                <RadioGroup
                  value={field.state.value ? "yes" : "no"}
                  onValueChange={(value) => field.handleChange(value === "yes")}
                  disabled={disabled}
                  className="flex flex-row flex-wrap gap-2"
                >
                  {[
                    { value: "yes", label: "Yêu cầu QC" },
                    { value: "no", label: "Không yêu cầu QC" },
                  ].map((option) => (
                    <Radio.Root
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer gap-2 rounded-md border border-input px-4 py-2 text-xs font-medium text-foreground data-checked:border-primary data-checked:bg-primary/5 data-checked:text-primary"
                    >
                      {option.label}
                    </Radio.Root>
                  ))}
                </RadioGroup>
              </div>
            )}
          </form.Field>
        </div>
      </div>
    )
  },
})
