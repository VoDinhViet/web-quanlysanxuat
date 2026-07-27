import { useQuery } from "@tanstack/react-query"
import type { AnyFormApi } from "@tanstack/react-form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel } from "@/components/ui/field"
import { ComboboxField } from "@/components/shared/ComboboxField"
import { withForm } from "@/hooks/use-app-form"
import { useGetClientOptions } from "@/hooks/use-get-client-options"
import { ORDER_FORM_DEFAULT_VALUES } from "@/features/orders/schemas/order-form.schema"
import { salesRepOptionsQueryOptions } from "@/features/orders/orders.query"
import {
  CURRENCY_LABELS,
  Currency,
  PAYMENT_TERM_LABELS,
} from "@/lib/types/order.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const CURRENCY_OPTIONS = buildOptionsFromLabels(CURRENCY_LABELS)
const PAYMENT_TERM_OPTIONS = buildOptionsFromLabels(PAYMENT_TERM_LABELS)

type ContactPickerProps = {
  form: AnyFormApi
  clientId: string
  clients: ReturnType<typeof useGetClientOptions>["clients"]
  disabled?: boolean
}

// Not a bound form field — "Người liên hệ" is a convenience picker over the
// selected client's already-embedded `contacts[]` (GET /api/clients nests
// them, no extra request needed). Picking one just fills 3 free-text fields;
// the picked contact's id itself is never sent to the backend.
function ContactPicker({
  form,
  clientId,
  clients,
  disabled,
}: ContactPickerProps) {
  const selectedClient = clients.find((client) => client.id === clientId)
  const contacts = selectedClient?.contacts ?? []

  return (
    <Field>
      <FieldLabel className="text-xs font-medium text-foreground">
        Người liên hệ
      </FieldLabel>
      <Select
        disabled={disabled || contacts.length === 0}
        onValueChange={(contactId) => {
          const contact = contacts.find((c) => c.id === contactId)
          form.setFieldValue("contactName", contact?.name ?? "")
          form.setFieldValue("contactPhone", contact?.phoneNumber ?? "")
          form.setFieldValue("contactEmail", contact?.email ?? "")
        }}
      >
        <SelectTrigger className="h-9 w-full bg-background text-xs">
          <SelectValue
            placeholder={
              clientId
                ? contacts.length === 0
                  ? "Khách hàng chưa có người liên hệ"
                  : "Chọn người liên hệ"
                : "Chọn khách hàng trước"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {contacts.map((contact) => (
            <SelectItem key={contact.id} value={contact.id} className="text-xs">
              {contact.isPrimary ? `${contact.name} (chính)` : contact.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export const OrderInfoSection = withForm({
  defaultValues: ORDER_FORM_DEFAULT_VALUES,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const client = useGetClientOptions()
    const { data: salesReps = [] } = useQuery(salesRepOptionsQueryOptions())
    const salesRepOptions = salesReps.map((rep) => ({
      value: rep.id,
      label: rep.name,
    }))

    return (
      <div>
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Thông tin đơn hàng
          </h2>
          <p className="text-sm text-muted-foreground">
            Khách hàng, người liên hệ và các điều khoản của đơn hàng
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-4 py-5 sm:grid-cols-2 sm:px-5 lg:grid-cols-4">
          <form.Field name="clientId">
            {(field) => (
              <ComboboxField
                id={field.name}
                label="Khách hàng"
                required
                placeholder="Chọn khách hàng"
                value={field.state.value || undefined}
                onValueChange={(next) => field.handleChange(next ?? "")}
                onBlur={field.handleBlur}
                isInvalid={
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                }
                errors={field.state.meta.errors}
                options={client.options}
                onSearchChange={client.onSearchChange}
                isLoading={client.isFetching}
                emptyMessage="Không tìm thấy khách hàng"
                disabled={disabled}
              />
            )}
          </form.Field>

          <form.AppField name="paymentTerm">
            {(field) => (
              <field.SelectField
                label="Điều khoản thanh toán"
                placeholder="Chọn điều khoản"
                options={PAYMENT_TERM_OPTIONS}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="currency">
            {(field) => (
              <field.SelectField
                label="Tiền tệ"
                required
                options={CURRENCY_OPTIONS}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.Subscribe selector={(state) => state.values.clientId}>
            {(clientId) => (
              <ContactPicker
                form={form}
                clientId={clientId}
                clients={client.clients}
                disabled={disabled}
              />
            )}
          </form.Subscribe>

          <form.AppField name="dueDate">
            {(field) => (
              <field.DateField
                label="Ngày giao hàng yêu cầu"
                required
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="deliveryAddress">
            {(field) => (
              <field.TextareaField
                label="Địa chỉ giao hàng"
                placeholder="Nhập địa chỉ giao hàng"
                disabled={disabled}
                className="sm:col-span-2 lg:col-span-1 lg:row-span-2"
              />
            )}
          </form.AppField>

          <form.Subscribe selector={(state) => state.values.currency}>
            {(currency) => (
              <form.AppField name="exchangeRate">
                {(field) => (
                  <field.TextField
                    label={`Tỷ giá quy đổi (${currency === Currency.VND ? "so với VND" : "1 " + currency + " = ? VND"})`}
                    type="number"
                    disabled={disabled}
                  />
                )}
              </form.AppField>
            )}
          </form.Subscribe>

          <form.AppField name="orderDate">
            {(field) => (
              <field.DateField
                label="Ngày đặt hàng"
                required
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="staffId">
            {(field) => (
              <field.SelectField
                label="Nhân viên kinh doanh"
                placeholder="Chọn nhân viên kinh doanh"
                options={salesRepOptions}
                disabled={disabled}
              />
            )}
          </form.AppField>

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Ghi chú"
                placeholder="Ghi chú hiển thị trên đơn hàng"
                disabled={disabled}
                className="sm:col-span-2 lg:col-span-4"
              />
            )}
          </form.AppField>

          <form.AppField name="internalNote">
            {(field) => (
              <field.TextareaField
                label="Ghi chú nội bộ"
                placeholder="Ghi chú nội bộ (không hiển thị cho khách hàng)"
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
