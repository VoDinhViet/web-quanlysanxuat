import { useQuery } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import {
  emptyStandaloneOutsourcingOrderItem,
  standaloneOutsourcingOrderFormDefaultValues,
} from "@/features/outsourcing-orders/schemas/standalone-outsourcing-order.schema"
import { unitOptionsQueryOptions } from "@/features/units/api"
import { withForm } from "@/hooks/use-app-form"

// Các dòng hàng gửi gia công: người dùng tự nhập mã, tên, đơn vị, SL, trọng lượng, diện tích, ghi chú.
export const StandaloneOutsourcingOrderItemsSection = withForm({
  defaultValues: standaloneOutsourcingOrderFormDefaultValues,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const { data: units = [], isPending: isUnitsPending } = useQuery(
      unitOptionsQueryOptions()
    )
    const unitOptions = units.map((unit) => ({
      value: unit.id,
      label: unit.name,
    }))

    return (
      <div className="px-4 py-5 sm:px-5">
        <h3 className="text-sm font-medium text-foreground">
          Danh sách hàng gửi gia công
        </h3>

        <form.Field name="items" mode="array">
          {(itemsField) => (
            <div className="mt-4 space-y-4">
              {itemsField.state.value.map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-x-4 gap-y-3 rounded-md border border-border/50 p-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <form.AppField name={`items[${index}].itemCode`}>
                    {(field) => (
                      <field.TextField
                        label="Mã hàng"
                        required
                        placeholder="Mã sản phẩm / chi tiết"
                        disabled={disabled}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name={`items[${index}].itemName`}>
                    {(field) => (
                      <field.TextField
                        label="Tên hàng"
                        required
                        placeholder="Tên sản phẩm / chi tiết"
                        disabled={disabled}
                        className="lg:col-span-2"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name={`items[${index}].unitId`}>
                    {(field) => (
                      <field.SelectField
                        label="Đơn vị"
                        required
                        placeholder="Chọn đơn vị"
                        options={unitOptions}
                        isPending={isUnitsPending}
                        disabled={disabled}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name={`items[${index}].quantity`}>
                    {(field) => (
                      <field.NumberField
                        label="SL gửi"
                        required
                        disabled={disabled}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name={`items[${index}].weight`}>
                    {(field) => (
                      <field.NumberField
                        label="Trọng lượng (kg)"
                        disabled={disabled}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name={`items[${index}].area`}>
                    {(field) => (
                      <field.NumberField
                        label="Diện tích (m²)"
                        disabled={disabled}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name={`items[${index}].note`}>
                    {(field) => (
                      <field.TextField
                        label="Ghi chú"
                        placeholder="Ghi chú (nếu có)"
                        disabled={disabled}
                      />
                    )}
                  </form.AppField>
                  <div className="flex items-end justify-end sm:col-span-2 lg:col-span-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      aria-label={`Bỏ dòng ${index + 1}`}
                      disabled={disabled || itemsField.state.value.length === 1}
                      onClick={() => void itemsField.removeValue(index)}
                    >
                      <Trash2 className="size-4" />
                      Bỏ dòng
                    </Button>
                  </div>
                </div>
              ))}

              <FieldError errors={itemsField.state.meta.errors} />

              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() =>
                  void itemsField.pushValue(emptyStandaloneOutsourcingOrderItem)
                }
              >
                <Plus className="size-4" />
                Thêm dòng
              </Button>
            </div>
          )}
        </form.Field>
      </div>
    )
  },
})
