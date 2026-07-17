import { withForm } from "@/hooks/use-app-form"
import { CREATE_USER_DEFAULT_VALUES } from "@/features/users/schemas/create-user.schema"
import { EMPLOYEE_STATUS_LABELS } from "@/features/users/types/user.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type {
  DepartmentOption,
  PositionOption,
} from "@/features/users/types/user.type"

const EMPLOYEE_STATUS_OPTIONS = buildOptionsFromLabels(EMPLOYEE_STATUS_LABELS)

type SelectOptionItem = {
  id: string
  name: string
}

function buildSelectOptions(items: SelectOptionItem[]) {
  return items.map((item) => ({ value: item.id, label: item.name }))
}

export const CreateUserJobInfoSection = withForm({
  defaultValues: CREATE_USER_DEFAULT_VALUES,
  props: {
    disabled: false,
    departments: [] as DepartmentOption[],
    positions: [] as PositionOption[],
  },
  render: function Render({ form, disabled, departments, positions }) {
    return (
      <div className="border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            2
          </span>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Thông tin công việc
            </h2>
            <p className="text-sm text-muted-foreground">
              Phân công và tình trạng làm việc
            </p>
          </div>
        </div>

        <div className="px-4 pb-5 sm:px-5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
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
                  className="sm:col-span-2"
                />
              )}
            </form.AppField>
          </div>
        </div>
      </div>
    )
  },
})
