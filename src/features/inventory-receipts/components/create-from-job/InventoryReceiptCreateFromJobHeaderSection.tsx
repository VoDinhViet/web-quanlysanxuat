import { useQuery } from "@tanstack/react-query"

import { ComboboxField } from "@/components/shared/inputs/ComboboxField"
import type { ComboboxOption } from "@/components/shared/inputs/ComboboxField"
import { withForm } from "@/hooks/use-app-form"
import { useGetProductionJobOptions } from "@/features/production-jobs/api"
import { createInventoryReceiptFormDefaultValues } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"
import { warehouseOptionsQueryOptions } from "@/features/warehouses/api"
import { buildSelectOptions } from "@/lib/utils"

// Đầu mục riêng cho InventoryReceiptCreateFromJobForm.tsx — không tái dùng
// InventoryReceiptCreateHeaderSection.tsx (đầu mục của form phiếu nhập kho chung, 4 loại phiếu). Luồng
// này chỉ có đúng 1 loại phiếu (PRODUCTION, cố định ở defaultValues của form cha, không có UI nào
// đổi được) nên không cần field "Loại phiếu", không cần NCC/PO/PR/LSX-text — chỉ giữ lại đúng
// những gì luồng nhập thành phẩm cần: Kho nhận, Ngày chứng từ, Job, Ghi chú.
export const InventoryReceiptCreateFromJobHeaderSection = withForm({
  defaultValues: createInventoryReceiptFormDefaultValues,
  props: {
    disabled: false,
    // Giá trị hiển thị sẵn cho combobox Job khi đến từ deep-link (?productionJobId=) — form cha
    // đã fetch chi tiết Job đó để tự điền dòng vật tư, tiện truyền luôn mã Job xuống đây thay vì
    // để combobox hiện trống cho tới khi người dùng gõ tìm lại.
    initialProductionJob: undefined as ComboboxOption | undefined,
  },
  render: function Render({ form, disabled, initialProductionJob }) {
    const { data: warehouses = [] } = useQuery(warehouseOptionsQueryOptions())
    // `null` — mọi trạng thái Job, không chỉ IN_PROGRESS: lúc cần nhập kho, Job đã QC xong nên
    // thường là WAITING_DELIVERY; sửa lại phiếu nháp cũ cũng cần thấy Job đã COMPLETED.
    const productionJob = useGetProductionJobOptions(null)

    return (
      <div className="drafting-title-block">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold tracking-wide text-foreground uppercase">
            Phiếu nhập kho thành phẩm
          </h2>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            Mã phiếu: sẽ cấp sau khi lưu · Loại phiếu: Từ sản xuất
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-4 py-5 sm:grid-cols-2 sm:px-5 lg:grid-cols-3">
          <form.AppField name="warehouseId">
            {(field) => (
              <field.SelectField
                label="Kho nhận"
                required
                placeholder="Chọn kho nhận"
                options={buildSelectOptions(warehouses)}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="receiptDate">
            {(field) => (
              <field.DateField
                label="Ngày chứng từ"
                required
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.Field name="productionJobId">
            {(field) => (
              <ComboboxField
                id={field.name}
                label="Lệnh sản xuất (Job)"
                placeholder="Chọn Job cần nhập kho thành phẩm"
                value={field.state.value || undefined}
                onValueChange={(next) => field.handleChange(next ?? "")}
                onBlur={field.handleBlur}
                options={productionJob.options}
                onSearchChange={productionJob.onSearchChange}
                isPending={productionJob.isFetching}
                initialOption={initialProductionJob}
                emptyMessage="Không tìm thấy Job"
                disabled={disabled}
              />
            )}
          </form.Field>

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú"
                placeholder="Ghi chú hiển thị trên phiếu"
                disabled={disabled}
                className="sm:col-span-2 lg:col-span-3"
              />
            )}
          </form.AppField>
        </div>
      </div>
    )
  },
})
