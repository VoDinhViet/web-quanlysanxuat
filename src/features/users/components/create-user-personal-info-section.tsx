import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreateUserAvatarField } from "@/features/users/components/create-user-avatar-field"
import { CreateUserDateField } from "@/features/users/components/create-user-date-field"
import type { CreateUserFormApi } from "@/features/users/components/create-user-form"
import { CreateUserTextareaField } from "@/features/users/components/create-user-textarea-field"
import { CreateUserTextField } from "@/features/users/components/create-user-text-field"
import {
  USER_GENDER_LABELS,
  USER_GENDERS,
} from "@/features/users/types/user.type"

type CreateUserPersonalInfoSectionProps = {
  form: CreateUserFormApi
  disabled: boolean
}

export function CreateUserPersonalInfoSection({
  form,
  disabled,
}: CreateUserPersonalInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-bold tracking-wide text-primary uppercase">
          1. Thông tin cá nhân
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto]">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <Field>
              <FieldLabel className="text-xs font-medium text-foreground">
                Mã nhân viên
              </FieldLabel>
              <Input
                value=""
                placeholder="Tự động"
                disabled
                readOnly
                className="h-9 bg-muted text-xs"
              />
            </Field>

            <form.Field name="fullName">
              {(field) => (
                <CreateUserTextField
                  id={field.name}
                  label="Họ và tên"
                  required
                  placeholder="Nhập họ và tên"
                  value={field.state.value}
                  errors={field.state.meta.errors}
                  isInvalid={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                  }
                  disabled={disabled}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>

            <form.Field name="gender">
              {(field) => (
                <div className="space-y-1.5 sm:col-span-2">
                  <span className="block text-xs font-medium text-foreground">
                    Giới tính
                  </span>
                  <RadioGroup
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as typeof field.state.value)
                    }
                    disabled={disabled}
                    className="flex flex-row gap-6"
                  >
                    {USER_GENDERS.map((gender) => (
                      <label
                        key={gender}
                        htmlFor={`gender-${gender}`}
                        className="flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground"
                      >
                        <RadioGroupItem
                          value={gender}
                          id={`gender-${gender}`}
                        />
                        {USER_GENDER_LABELS[gender]}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </form.Field>

            <form.Field name="dateOfBirth">
              {(field) => (
                <CreateUserDateField
                  id={field.name}
                  label="Ngày sinh"
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

            <form.Field name="idNumber">
              {(field) => (
                <CreateUserTextField
                  id={field.name}
                  label="Số CCCD/CMND"
                  placeholder="Nhập số CCCD/CMND"
                  value={field.state.value}
                  disabled={disabled}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>

            <form.Field name="phoneNumber">
              {(field) => (
                <CreateUserTextField
                  id={field.name}
                  label="Số điện thoại"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={field.state.value}
                  disabled={disabled}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>

            <form.Field name="email">
              {(field) => (
                <CreateUserTextField
                  id={field.name}
                  label="Email"
                  type="email"
                  placeholder="Nhập email"
                  value={field.state.value}
                  errors={field.state.meta.errors}
                  isInvalid={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                  }
                  disabled={disabled}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>

            <form.Field name="address">
              {(field) => (
                <CreateUserTextareaField
                  id={field.name}
                  label="Địa chỉ thường trú"
                  placeholder="Nhập địa chỉ thường trú"
                  value={field.state.value}
                  disabled={disabled}
                  className="sm:col-span-2"
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>
          </div>

          <form.Field name="avatarUrl">
            {(field) => (
              <CreateUserAvatarField
                value={field.state.value}
                onChange={field.handleChange}
                disabled={disabled}
              />
            )}
          </form.Field>
        </div>
      </CardContent>
    </Card>
  )
}
