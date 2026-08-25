import { useEffect } from "react"
import { useField } from "@tanstack/react-form"

import { ComboboxField } from "@/components/shared/inputs/ComboboxField"
import type { ComboboxOption } from "@/components/shared/inputs/ComboboxField"
import { withForm } from "@/hooks/use-app-form"
import { useGetClientOptions } from "@/features/clients/api"
import { useGetSupplierOptions } from "@/features/suppliers/api"
import { useGetPurchaseOrderOptions } from "@/features/inventory-receipts/hooks/use-get-purchase-order-options"
import { useGetProductionJobOptions } from "@/features/production-jobs/api"
import { updateInventoryReceiptFormDefaultValues } from "@/features/inventory-receipts/schemas/update-inventory-receipt.schema"
import {
  InventoryReceiptType,
  inventoryReceiptTypeLabels,
} from "@/lib/types/inventory-receipt.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const receiptTypeOptions = buildOptionsFromLabels(inventoryReceiptTypeLabels)

// Không có `warehouseId`/`code` — cả hai bất biến sau khi tạo phiếu (`update-inventory-receipt.
// schema.ts` không có field warehouseId), hiển thị read-only qua props thay vì field.
export const InventoryReceiptUpdateHeaderSection = withForm({
  defaultValues: updateInventoryReceiptFormDefaultValues,
  props: {
    disabled: false,
    receiptCode: "",
    warehouseName: "",
    initialSupplier: undefined as ComboboxOption | undefined,
    initialClient: undefined as ComboboxOption | undefined,
    initialPurchaseOrder: undefined as ComboboxOption | undefined,
    initialProductionJob: undefined as ComboboxOption | undefined,
  },
  render: function Render({
    form,
    disabled,
    receiptCode,
    warehouseName,
    initialSupplier,
    initialClient,
    initialPurchaseOrder,
    initialProductionJob,
  }) {
    const supplier = useGetSupplierOptions()
    const client = useGetClientOptions()
    const purchaseOrder = useGetPurchaseOrderOptions()
    // `null` — mọi trạng thái Job: sửa phiếu nháp cũ vẫn cần thấy Job dù đã COMPLETED.
    const productionJob = useGetProductionJobOptions(null)
    const receiptType = useField({ form, name: "receiptType" }).state.value

    useEffect(() => {
      if (receiptType !== InventoryReceiptType.PURCHASE) {
        form.setFieldValue("supplierId", "")
        form.setFieldValue("purchaseOrderId", "")
      }
      if (receiptType !== InventoryReceiptType.RETURN) {
        form.setFieldValue("clientId", "")
      }
      if (receiptType !== InventoryReceiptType.PRODUCTION) {
        form.setFieldValue("productionJobId", "")
      }
    }, [receiptType, form])

    const isPurchase = receiptType === InventoryReceiptType.PURCHASE
    const isReturn = receiptType === InventoryReceiptType.RETURN
    const isProduction = receiptType === InventoryReceiptType.PRODUCTION

    return (
      <div className="drafting-title-block">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold tracking-wide text-foreground uppercase">
            Phiếu nhập kho
          </h2>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            Mã phiếu: {receiptCode} · Kho nhận: {warehouseName}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-4 py-5 sm:grid-cols-2 sm:px-5 lg:grid-cols-4">
          <form.AppField name="receiptType">
            {(field) => (
              <field.SelectField
                label="Loại phiếu"
                required
                options={receiptTypeOptions}
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

          {isPurchase && (
            <form.Field name="supplierId">
              {(field) => (
                <ComboboxField
                  id={field.name}
                  label="Nhà cung cấp"
                  placeholder="Chọn nhà cung cấp"
                  value={field.state.value || undefined}
                  onValueChange={(next) => field.handleChange(next ?? "")}
                  onBlur={field.handleBlur}
                  options={supplier.options}
                  onSearchChange={supplier.onSearchChange}
                  isPending={supplier.isFetching}
                  initialOption={initialSupplier}
                  emptyMessage="Không tìm thấy nhà cung cấp"
                  disabled={disabled}
                />
              )}
            </form.Field>
          )}

          {isPurchase && (
            <form.Field name="purchaseOrderId">
              {(field) => (
                <ComboboxField
                  id={field.name}
                  label="Đơn mua hàng (PO)"
                  placeholder="Chọn PO đã đặt hàng"
                  value={field.state.value || undefined}
                  onValueChange={(next) => field.handleChange(next ?? "")}
                  onBlur={field.handleBlur}
                  options={purchaseOrder.options}
                  onSearchChange={purchaseOrder.onSearchChange}
                  isPending={purchaseOrder.isFetching}
                  initialOption={initialPurchaseOrder}
                  emptyMessage="Không tìm thấy PO đang ở trạng thái đã đặt hàng"
                  disabled={disabled}
                />
              )}
            </form.Field>
          )}

          {isReturn && (
            <form.Field name="clientId">
              {(field) => (
                <ComboboxField
                  id={field.name}
                  label="Khách hàng gửi trả"
                  placeholder="Chọn khách hàng"
                  value={field.state.value || undefined}
                  onValueChange={(next) => field.handleChange(next ?? "")}
                  onBlur={field.handleBlur}
                  options={client.options}
                  onSearchChange={client.onSearchChange}
                  isPending={client.isFetching}
                  initialOption={initialClient}
                  emptyMessage="Không tìm thấy khách hàng"
                  disabled={disabled}
                />
              )}
            </form.Field>
          )}

          <form.AppField name="purchaseRequestId">
            {(field) => (
              <field.TextField
                label="Mã đề xuất mua hàng (PR)"
                placeholder="UUID đề xuất mua hàng liên quan (nếu có)"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="productionOrderId">
            {(field) => (
              <field.TextField
                label="Mã lệnh sản xuất (LSX)"
                placeholder="UUID lệnh sản xuất liên quan (nếu có)"
                disabled={disabled}
              />
            )}
          </form.AppField>

          {isProduction && (
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
          )}

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú"
                placeholder="Ghi chú hiển thị trên phiếu"
                disabled={disabled}
                className="sm:col-span-2 lg:col-span-4"
              />
            )}
          </form.AppField>
        </div>
      </div>
    )
  },
})
