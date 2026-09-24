import { useEffect, useRef } from "react"
import { useField } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import {
  Building2,
  CalendarDays,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Lock,
  MapPin,
  Phone,
  RotateCcw,
} from "lucide-react"
import { toast } from "sonner"

import { ComboboxField } from "@/components/shared/composites/ComboboxField"
import type { ComboboxOption } from "@/components/shared/composites/ComboboxField"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { clientQueryOptions } from "@/features/clients/api"
import { exchangeRateQueryOptions } from "@/features/orders/api/options"
import { ClientPicker } from "@/features/orders/components/composites/ClientPicker"
import { pickDefaultContactId } from "@/features/orders/constants/pick-default-contact-id"
import { resolveExchangeRatePlaceholder } from "@/features/orders/constants/resolve-exchange-rate-placeholder"
import { useClientContactOptions } from "@/features/orders/hooks/use-client-contact-options"
import { updateOrderFormDefaultValues } from "@/features/orders/schemas/update-order.schema"
import { useGetUserOptions } from "@/features/users/api"
import { withForm } from "@/hooks/use-app-form"
import {
  Currency,
  currencyLabels,
  OrderStatus,
  orderStatusLabels,
} from "@/lib/types/order.type"
import { paymentTermShortLabels } from "@/lib/types/payment-term.type"
import { buildOptionsFromLabels, cn } from "@/lib/utils"

const currencyOptions = buildOptionsFromLabels(currencyLabels)
const paymentTermOptions = buildOptionsFromLabels(paymentTermShortLabels)
// AWAITING_PRODUCTION/REJECTED excluded: only reachable via the "Duyệt"/"Từ chối" actions
// (approve-order.api.ts/reject-order.api.ts), never settable directly through this form
// (order.error.status_not_settable_directly) — see the matching drop in update-order.api.ts.
const orderStatusOptions = buildOptionsFromLabels(orderStatusLabels).filter(
  (option) =>
    option.value !== OrderStatus.AWAITING_PRODUCTION &&
    option.value !== OrderStatus.REJECTED
)

type OrderFormSectionProps = {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  badge?: React.ReactNode
  children: React.ReactNode
  className?: string
}

function OrderFormSection({
  icon: Icon,
  title,
  description,
  badge,
  children,
  className,
}: OrderFormSectionProps) {
  return (
    <section className={cn("px-4 py-5 sm:px-6 sm:py-6", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-5">
        <div>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-4 text-primary" />}
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              {title}
            </h3>
          </div>
          {description ? (
            <p className={cn("mt-0.5 text-xs text-muted-foreground", Icon && "pl-6")}>
              {description}
            </p>
          ) : null}
        </div>
        {badge ? <div>{badge}</div> : null}
      </div>
      {children}
    </section>
  )
}

// Bước ① của wizard Cập nhật đơn hàng. Giao diện được cấu trúc theo 4 phân vùng trực quan rõ ràng.
export const UpdateOrderInfoSection = withForm({
  defaultValues: updateOrderFormDefaultValues,
  props: {
    disabled: false,
    orderCode: "",
    initialAssigneeOption: undefined as ComboboxOption | undefined,
  },
  render: function Render({
    form,
    disabled,
    orderCode,
    initialAssigneeOption,
  }) {
    const user = useGetUserOptions()

    const currency = useField({ form, name: "currency" }).state.value
    const clientContactField = useField({ form, name: "clientContactId" })
    const clientId = useField({ form, name: "clientId" }).state.value
    const contactOptions = useClientContactOptions(clientId || undefined)
    const { data: selectedClient } = useQuery({
      ...clientQueryOptions(clientId || ""),
      enabled: !!clientId,
    })
    const { data: rate, isFetching } = useQuery({
      ...exchangeRateQueryOptions(currency),
      enabled: currency !== Currency.VND,
    })

    const appliedRef = useRef({
      currency,
      rate: form.getFieldValue("exchangeRate"),
    })

    useEffect(() => {
      if (currency === appliedRef.current.currency) return

      const current = form.getFieldValue("exchangeRate")

      // Field no longer holds what we last wrote — someone else (the order's own saved
      // rate, a manual edit) owns it now. Adopt it and stop auto-filling until the
      // currency changes again.
      if (current !== appliedRef.current.rate) {
        appliedRef.current = { currency, rate: current }
        return
      }

      if (currency === Currency.VND) {
        form.setFieldValue("exchangeRate", 1)
        appliedRef.current = { currency, rate: 1 }
        return
      }

      if (current !== undefined) {
        form.setFieldValue("exchangeRate", undefined)
        appliedRef.current = { ...appliedRef.current, rate: undefined }
      }

      if (rate) {
        form.setFieldValue("exchangeRate", rate)
        appliedRef.current = { currency, rate }
      }
    }, [currency, rate, form])

    const exchangeRatePlaceholder = resolveExchangeRatePlaceholder(
      isFetching,
      rate
    )

    return (
      <div>
        {/* Header thông tin đơn hàng */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="size-5 text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base font-semibold tracking-wide text-foreground uppercase">
                  Chỉnh sửa đơn hàng
                </h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  Bước 1 / 3
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Cập nhật thông tin khách hàng, tiến độ giao hàng và điều kiện thanh toán
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 font-mono text-xs text-foreground">
            <span className="text-muted-foreground">Mã đơn hàng:</span>
            <span className="font-semibold text-primary">{orderCode}</span>
          </div>
        </div>

        {/* Thân form chia thành 4 phân vùng bằng đường kẻ border rõ ràng */}
        <div className="divide-y divide-border/70">
          {/* VÙNG 1: KHÁCH HÀNG & PHỤ TRÁCH */}
          <OrderFormSection
            icon={Building2}
            title="1. Thông tin khách hàng & Phụ trách"
            description="Đơn vị mua hàng, người liên hệ tiếp nhận và nhân viên phụ trách kinh doanh"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <form.Field name="clientId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel className="text-xs font-medium text-foreground">
                        Khách hàng <span className="text-destructive">*</span>
                      </FieldLabel>
                      <ClientPicker
                        value={field.state.value || undefined}
                        onValueChange={(next) =>
                          field.handleChange(next ?? "")
                        }
                        onClientSelect={(client) =>
                          clientContactField.handleChange(
                            pickDefaultContactId(client)
                          )
                        }
                        onBlur={field.handleBlur}
                        isInvalid={isInvalid}
                        disabled={disabled}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              </form.Field>

              <form.AppField name="clientContactId">
                {(field) => (
                  <field.SelectField
                    label="Người liên hệ"
                    placeholder={
                      clientId
                        ? "Chọn người liên hệ"
                        : "Vui lòng chọn khách hàng trước"
                    }
                    options={contactOptions.options}
                    isPending={contactOptions.isPending}
                    disabled={disabled || !clientId}
                  />
                )}
              </form.AppField>

              <form.Field name="assignedUserId">
                {(field) => (
                  <ComboboxField
                    id={field.name}
                    label="Nhân viên kinh doanh"
                    placeholder="Chọn nhân viên kinh doanh"
                    value={field.state.value || undefined}
                    onValueChange={(next) => field.handleChange(next ?? "")}
                    onBlur={field.handleBlur}
                    isInvalid={
                      field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0
                    }
                    errors={field.state.meta.errors}
                    options={user.options}
                    onSearchChange={user.onSearchChange}
                    isPending={user.isFetching}
                    initialOption={initialAssigneeOption}
                    emptyMessage="Không tìm thấy nhân viên"
                    disabled={disabled}
                  />
                )}
              </form.Field>

              {selectedClient && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:col-span-3">
                  <span className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Mã KH:</span>
                    <span className="font-medium text-foreground">
                      {selectedClient.code}
                    </span>
                  </span>
                  {selectedClient.taxCode && (
                    <>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="flex items-center gap-1">
                        <span className="text-muted-foreground">MST:</span>
                        <span className="font-mono text-foreground">
                          {selectedClient.taxCode}
                        </span>
                      </span>
                    </>
                  )}
                  {selectedClient.phoneNumber && (
                    <>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="size-3 text-muted-foreground/70" />
                        <span className="font-mono text-foreground">
                          {selectedClient.phoneNumber}
                        </span>
                      </span>
                    </>
                  )}
                  {selectedClient.address && (
                    <>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="flex min-w-0 items-center gap-1">
                        <MapPin className="size-3 shrink-0 text-muted-foreground/70" />
                        <span
                          className="truncate text-foreground/90"
                          title={selectedClient.address}
                        >
                          {selectedClient.address}
                        </span>
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </OrderFormSection>

          {/* VÙNG 2: KẾ HOẠCH & ĐỊA CHỈ GIAO HÀNG */}
          <OrderFormSection
            icon={CalendarDays}
            title="2. Kế hoạch & Địa chỉ giao hàng"
            description="PO của khách, các mốc thời gian đặt/giao, trạng thái và địa điểm nhận hàng"
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <form.AppField name="buyerPoNo">
                  {(field) => (
                    <field.TextField
                      label="PO"
                      placeholder="Nhập PO (nếu có)"
                      disabled={disabled}
                    />
                  )}
                </form.AppField>

                <form.AppField name="orderDate">
                  {(field) => (
                    <field.DateField
                      label="Ngày đặt hàng"
                      required
                      disabled={disabled}
                    />
                  )}
                </form.AppField>

                <form.AppField name="dueDate">
                  {(field) => (
                    <field.DateField
                      label="Ngày giao hàng yêu cầu"
                      required
                      disabled={disabled}
                    />
                  )}
                </form.AppField>

                <form.AppField name="status">
                  {(field) => (
                    <field.SelectField
                      label="Trạng thái đơn hàng"
                      required
                      options={orderStatusOptions}
                      disabled={disabled}
                    />
                  )}
                </form.AppField>
              </div>

              <form.Field name="consigneeAddress">
                {(field) => (
                  <Field className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <FieldLabel
                        htmlFor="consigneeAddress"
                        className="text-xs font-medium text-foreground"
                      >
                        Địa chỉ giao hàng
                      </FieldLabel>
                      {selectedClient?.address && !disabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            field.handleChange(selectedClient.address!)
                            toast.success(
                              "Đã cập nhật Địa chỉ giao hàng theo khách hàng"
                            )
                          }}
                          className="h-6 gap-1 px-1.5 text-xs text-primary hover:text-primary"
                        >
                          <RotateCcw className="size-3" />
                          <span>Lấy theo địa chỉ khách hàng</span>
                        </Button>
                      )}
                    </div>
                    <Textarea
                      id="consigneeAddress"
                      placeholder="Nhập địa chỉ giao hàng chi tiết..."
                      disabled={disabled}
                      maxLength={500}
                      className="min-h-20 resize-none bg-background text-xs"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            </div>
          </OrderFormSection>

          {/* VÙNG 3: THANH TOÁN & TIỀN TỆ */}
          <OrderFormSection
            icon={CreditCard}
            title="3. Điều khoản thanh toán & Tiền tệ"
            description="Phương thức thanh toán thỏa thuận, đơn vị tiền tệ và tỷ giá quy đổi sang VNĐ"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <form.AppField name="paymentTerm">
                {(field) => (
                  <field.SelectField
                    label="Điều khoản thanh toán"
                    placeholder="Chọn điều khoản thanh toán"
                    options={paymentTermOptions}
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="currency">
                {(field) => (
                  <field.SelectField
                    label="Tiền tệ"
                    required
                    options={currencyOptions}
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="exchangeRate">
                {(field) => (
                  <field.NumberField
                    label={`Tỷ giá quy đổi (${
                      currency === Currency.VND
                        ? "so với VND"
                        : "1 " + currency + " = ? VND"
                    })`}
                    required
                    placeholder={exchangeRatePlaceholder}
                    disabled={disabled}
                  />
                )}
              </form.AppField>
            </div>
          </OrderFormSection>

          {/* VÙNG 4: GHI CHÚ & LƯU Ý */}
          <OrderFormSection
            icon={FileText}
            title="4. Ghi chú & Lưu ý"
            description="Ghi chú công khai in trên phiếu gửi khách hàng và lưu ý kiểm soát nội bộ"
          >
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="space-y-1.5">
                <form.AppField name="note">
                  {(field) => (
                    <field.TextareaField
                      label="Ghi chú in trên đơn hàng (Công khai)"
                      placeholder="Ghi chú hiển thị trên đơn hàng và chứng từ gửi khách hàng..."
                      disabled={disabled}
                      maxLength={1000}
                    />
                  )}
                </form.AppField>
                <p className="text-[11px] text-muted-foreground">
                  Ghi chú này sẽ xuất hiện trên bản in chứng từ gửi đối tác.
                </p>
              </div>

              <div className="space-y-1.5">
                <form.AppField name="internalNote">
                  {(field) => (
                    <field.TextareaField
                      label="Ghi chú nội bộ (Bảo mật)"
                      placeholder="Ghi chú nội bộ (chỉ lưu hành nội bộ, không hiển thị cho khách)..."
                      disabled={disabled}
                      maxLength={1000}
                    />
                  )}
                </form.AppField>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Lock className="size-3 text-amber-500" />
                  Chỉ lưu hành nội bộ xưởng sản xuất và kế toán, không in gửi khách.
                </p>
              </div>
            </div>
          </OrderFormSection>
        </div>
      </div>
    )
  },
})

