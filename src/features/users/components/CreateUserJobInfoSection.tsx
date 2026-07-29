import { useSuspenseQuery } from "@tanstack/react-query"

import { withForm } from "@/hooks/use-app-form"
import {
  departmentsQueryOptions,
  positionsQueryOptions,
} from "@/features/users/api/users.options"
import { createUserFormDefaultValues } from "@/features/users/schemas/create-user.schema"
import { EMPLOYEE_STATUS_LABELS } from "@/lib/types/user.type"
import { buildOptionsFromLabels, buildSelectOptions } from "@/lib/utils"

const EMPLOYEE_STATUS_OPTIONS = buildOptionsFromLabels(EMPLOYEE_STATUS_LABELS)

export const CreateUserJobInfoSection = withForm({
  defaultValues: createUserFormDefaultValues,
  props: {
    disabled: false,
  },
  render: function Render({ form, disabled }) {
    // The route loader already prefetches both — resolves synchronously off cache.
    const { data: departments } = useSuspenseQuery(departmentsQueryOptions())
    const { data: positions } = useSuspenseQuery(positionsQueryOptions())

    return (
      <div>
        <div className="px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Thông tin công việc
          </h2>
          <p className="text-sm text-muted-foreground">
            Phân công và tình trạng làm việc
          </p>
        </div>

        <div className="px-4 pb-5 sm:px-5">
          <div className="space-y-5">
            <form.AppField name="departmentId">
              {(field) => (
                <field.SelectField
                  label="Phòng ban"
                  required
                  placeholder="Chọn phòng ban"
                  options={buildSelectOptions(departments)}
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="positionId">
              {(field) => (
                <field.SelectField
                  label="Chức vụ"
                  required
                  placeholder="Chọn chức vụ"
                  options={buildSelectOptions(positions)}
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="hireDate">
              {(field) => (
                <field.DateField
                  label="Ngày vào làm"
                  required
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="note">
              {(field) => (
                <field.TextareaField
                  label="Ghi chú"
                  placeholder="Nhập ghi chú (nếu có)"
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField name="status">
              {(field) => (
                <field.RadioPillField
                  label="Tình trạng nhân sự"
                  required
                  options={EMPLOYEE_STATUS_OPTIONS}
                  disabled={disabled}
                />
              )}
            </form.AppField>
          </div>
        </div>
      </div>
    )
  },
})
