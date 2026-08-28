import { FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { withForm } from "@/hooks/use-app-form"
import { createInventoryReceiptOtherFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt-other.schema"
import { inventoryReceiptAssetTypeLabels } from "@/lib/types/inventory-receipt.type"
import { buildOptionsFromLabels, cn } from "@/lib/utils"

const assetTypeOptions = buildOptionsFromLabels(inventoryReceiptAssetTypeLabels)

// Bước ① của wizard "Khác" — không tái dùng InventoryReceiptCreateHeaderSection.tsx (đầu mục của
// form phiếu nhập kho chung, 4 loại phiếu). Luồng này chỉ có đúng 1 loại phiếu (ADJUSTMENT, cố
// định ở defaultValues của form cha, không có UI nào đổi được) nên không cần field "Loại phiếu",
// không cần combobox NCC/PO/Job/PR/LSX. Không có field "Kho nhận" — chỉ đúng 1 kho loại RM, form
// cha tự gắn warehouseId (xem InventoryReceiptCreateOtherForm.tsx's warehouseId prop, cùng khuôn
// CreateInventoryRequisitionForm.tsx). Khung "① Tiêu đề + mô tả" cùng khuôn
// InventoryReceiptCreateFromPoPickerSection.tsx — không còn thanh tiêu đề/mã phiếu cũ (form 1
// bước trước đây), 4 bước của wizard "Từ PO" cũng không có thanh đó ở bất cứ bước nào.
export const InventoryReceiptCreateOtherHeaderSection = withForm({
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
            Ngày chứng từ, lý do nhập kho và yêu cầu QC cho phiếu này.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <form.AppField name="receiptDate">
            {(field) => (
              <field.DateField label="Ngày nhập" required disabled={disabled} />
            )}
          </form.AppField>

          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-foreground">
              Nguồn nhập
            </span>
            <p className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-xs text-muted-foreground">
              Nhập từ khác
            </p>
          </div>

          <form.AppField name="assetType">
            {(field) => (
              <field.RadioPillField
                label="Loại tài sản"
                required
                disabled={disabled}
                options={assetTypeOptions}
              />
            )}
          </form.AppField>

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="PO / Lý do"
                required
                placeholder="Nhập PO / lý do nhập kho (điều chỉnh kiểm kê, trả vật tư dư, thu hồi, hàng mẫu...)"
                disabled={disabled}
                className="sm:col-span-2 lg:col-span-4"
              />
            )}
          </form.AppField>

          {/* `requiresIqc` là boolean trong form state (không đổi sang chuỗi "no"/"yes" như
              InventoryReceiptCreateFromPoItemsSection.tsx's field.RadioPillField) — đổi type sẽ làm
              form mất khả năng tái dùng InventoryReceiptCreateGenericItemsSection bên dưới, vốn
              khoá cứng theo CreateInventoryReceiptSchema. Đánh chữ pill-style y hệt RadioPillField
              (AppFormFields.tsx) — chỉ khác ở kiểu field (boolean thay vì string enum). */}
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
                    <FieldLabel
                      key={option.value}
                      htmlFor={`requiresIqc-${option.value}`}
                      className={cn(
                        "cursor-pointer gap-2 rounded-md border border-input px-4 py-2 text-xs font-medium text-foreground",
                        "has-data-checked:border-primary has-data-checked:bg-primary/5 has-data-checked:text-primary"
                      )}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`requiresIqc-${option.value}`}
                      />
                      {option.label}
                    </FieldLabel>
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
