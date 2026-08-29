import { withForm } from "@/hooks/use-app-form"
import { updateSupplierFormDefaultValues } from "@/features/suppliers/schemas/update-supplier.schema"
import { paymentMethodLabels } from "@/lib/types/supplier.type"
import { paymentTermLabels } from "@/lib/types/payment-term.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const paymentMethodOptions = buildOptionsFromLabels(paymentMethodLabels)
const paymentTermOptions = buildOptionsFromLabels(paymentTermLabels)

export const UpdateSupplierPaymentSection = withForm({
  defaultValues: updateSupplierFormDefaultValues,
  props: {
    disabled: false,
  },
  render: function Render({ form, disabled }) {
    return (
      <div>
        <div className="px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Thông tin thanh toán
          </h2>
          <p className="text-sm text-muted-foreground">
            Tài khoản ngân hàng và điều khoản công nợ mặc định
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-4 pb-5 sm:grid-cols-2 sm:px-5">
          <form.AppField name="payment.bankName">
            {(field) => (
              <field.TextField
                label="Tên ngân hàng"
                placeholder="Nhập tên ngân hàng"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="payment.bankAccountNumber">
            {(field) => (
              <field.TextField
                label="Số tài khoản"
                placeholder="Nhập số tài khoản"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="payment.bankAccountHolder">
            {(field) => (
              <field.TextField
                label="Chủ tài khoản"
                placeholder="Nhập chủ tài khoản"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="payment.bankBranch">
            {(field) => (
              <field.TextField
                label="Chi nhánh"
                placeholder="Nhập chi nhánh ngân hàng"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="payment.defaultPaymentMethod">
            {(field) => (
              <field.SelectField
                label="Phương thức thanh toán mặc định"
                placeholder="Chọn phương thức"
                options={paymentMethodOptions}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="payment.defaultPaymentTerm">
            {(field) => (
              <field.SelectField
                label="Điều khoản thanh toán mặc định"
                placeholder="Chọn điều khoản"
                options={paymentTermOptions}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="payment.creditLimit">
            {(field) => (
              <field.NumberField
                label="Hạn mức công nợ (VND)"
                placeholder="0"
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="payment.creditLimitStartDate">
            {(field) => (
              <field.DateField
                label="Ngày bắt đầu áp dụng"
                disabled={disabled}
              />
            )}
          </form.AppField>
        </div>
      </div>
    )
  },
})
