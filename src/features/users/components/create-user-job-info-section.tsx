import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateUserDateField } from "@/features/users/components/create-user-date-field"
import type { CreateUserFormApi } from "@/features/users/components/create-user-form"
import { CreateUserTextareaField } from "@/features/users/components/create-user-textarea-field"
import {
  EMPLOYMENT_STATUS_LABELS,
  EMPLOYMENT_STATUSES,
} from "@/features/users/types/user.type"
import type {
  Department,
  Position,
} from "@/features/users/types/organization.type"

type CreateUserJobInfoSectionProps = {
  form: CreateUserFormApi
  disabled: boolean
  departments: Department[]
  positions: Position[]
}

export function CreateUserJobInfoSection({
  form,
  disabled,
  departments,
  positions,
}: CreateUserJobInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-bold tracking-wide text-primary uppercase">
          2. Thông tin công việc
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <form.Field name="departmentId">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && field.state.meta.errors.length > 0

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-xs font-medium text-foreground"
                  >
                    Phòng ban <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    disabled={disabled}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full text-xs"
                      aria-invalid={isInvalid}
                      onBlur={field.handleBlur}
                    >
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="positionId">
            {(field) => (
              <Field>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-xs font-medium text-foreground"
                >
                  Chức vụ
                </FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  disabled={disabled}
                >
                  <SelectTrigger
                    id={field.name}
                    className="w-full text-xs"
                    onBlur={field.handleBlur}
                  >
                    <SelectValue placeholder="Chọn chức vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position.id} value={position.id}>
                        {position.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          </form.Field>

          <form.Field name="hireDate">
            {(field) => (
              <CreateUserDateField
                id={field.name}
                label="Ngày vào làm"
                required
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                isInvalid={
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                }
                errors={field.state.meta.errors}
                disabled={disabled}
              />
            )}
          </form.Field>

          <form.Field name="note">
            {(field) => (
              <CreateUserTextareaField
                id={field.name}
                label="Ghi chú"
                placeholder="Nhập ghi chú (nếu có)"
                value={field.state.value}
                disabled={disabled}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
              />
            )}
          </form.Field>

          <form.Field name="employmentStatus">
            {(field) => (
              <div className="space-y-1.5 sm:col-span-2">
                <span className="block text-xs font-medium text-foreground">
                  Tình trạng nhân sự <span className="text-destructive">*</span>
                </span>
                <RadioGroup
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as typeof field.state.value)
                  }
                  disabled={disabled}
                  className="w-fit gap-3 rounded-md border border-input p-3"
                >
                  {EMPLOYMENT_STATUSES.map((status) => (
                    <label
                      key={status}
                      htmlFor={`employment-status-${status}`}
                      className="flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground"
                    >
                      <RadioGroupItem
                        value={status}
                        id={`employment-status-${status}`}
                      />
                      {EMPLOYMENT_STATUS_LABELS[status]}
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}
          </form.Field>
        </div>
      </CardContent>
    </Card>
  )
}
