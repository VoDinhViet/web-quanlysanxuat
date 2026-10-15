import { useQuery } from "@tanstack/react-query"

import { departmentQueryOptions } from "@/features/departments/api"
import { NcrCreateStepCard } from "@/features/ncrs/components/layouts/NcrCreateStepCard"
import { createNcrFormDefaultValues } from "@/features/ncrs/schemas/create-ncr.schema"
import { withForm } from "@/hooks/use-app-form"
import { buildSelectOptions } from "@/lib/utils"

type NcrDefectDetailsStepProps = {
  disabled: boolean
  isCustomerNcr: boolean
  isDone: boolean
  unitName: string | undefined
}

const defaultProps: NcrDefectDetailsStepProps = {
  disabled: false,
  isCustomerNcr: false,
  isDone: false,
  unitName: undefined,
}

// Step 4: department, NG quantity and description. The department is required only for NCR-KH.
export const NcrDefectDetailsStep = withForm({
  defaultValues: createNcrFormDefaultValues,
  props: defaultProps,
  render: function Render({ form, disabled, isCustomerNcr, isDone, unitName }) {
    const { data: departments = [], isPending: isDepartmentsPending } =
      useQuery(departmentQueryOptions())

    return (
      <NcrCreateStepCard
        step={4}
        title="Chi tiết lỗi"
        description="Bộ phận phát sinh, số lượng và mô tả lỗi"
        isDone={isDone}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <form.AppField name="departmentId">
              {(field) => (
                <field.SelectField
                  label="Bộ phận phát sinh"
                  required={isCustomerNcr}
                  placeholder="Chọn bộ phận"
                  options={buildSelectOptions(departments)}
                  isPending={isDepartmentsPending}
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="ngQty">
              {(field) => (
                <field.NumberField
                  label={unitName ? `SL hàng lỗi (${unitName})` : "SL hàng lỗi"}
                  placeholder="0"
                  disabled={disabled}
                />
              )}
            </form.AppField>
          </div>

          <form.AppField name="defectDescription">
            {(field) => (
              <field.TextareaField
                label="Mô tả lỗi"
                placeholder="Mô tả lỗi / nội dung khách hàng phản hồi"
                maxLength={1000}
                disabled={disabled}
              />
            )}
          </form.AppField>
        </div>
      </NcrCreateStepCard>
    )
  },
})
