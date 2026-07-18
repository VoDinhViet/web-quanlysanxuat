import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { withForm } from "@/hooks/use-app-form"
import { UserAvatarField } from "@/features/users/components/UserAvatarField"
import { CREATE_USER_DEFAULT_VALUES } from "@/features/users/schemas/create-user.schema"
import { USER_GENDER_LABELS } from "@/features/users/types/user.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const GENDER_OPTIONS = buildOptionsFromLabels(USER_GENDER_LABELS)

export const CreateUserInfoSection = withForm({
  defaultValues: CREATE_USER_DEFAULT_VALUES,
  props: {
    disabled: false,
  },
  render: function Render({ form, disabled }) {
    return (
      <div>
        <div className="px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Thông tin cá nhân
          </h2>
          <p className="text-sm text-muted-foreground">
            Thông tin định danh cơ bản của nhân sự
          </p>
        </div>

        <div className="px-4 pb-5 sm:px-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <Field>
                <FieldLabel className="text-xs font-medium text-foreground">
                  Mã nhân viên <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  readOnly
                  disabled
                  placeholder="Tự động tạo"
                  className="h-9 bg-background text-xs"
                />
              </Field>

              <form.AppField name="fullName">
                {(field) => (
                  <field.TextField
                    label="Họ và tên"
                    required
                    placeholder="Nhập họ và tên"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="gender">
                {(field) => (
                  <field.RadioPillField
                    label="Giới tính"
                    options={GENDER_OPTIONS}
                    disabled={disabled}
                    className="sm:col-span-2"
                  />
                )}
              </form.AppField>

              <form.AppField name="dateOfBirth">
                {(field) => (
                  <field.DateField label="Ngày sinh" disabled={disabled} />
                )}
              </form.AppField>

              <form.AppField name="idNumber">
                {(field) => (
                  <field.TextField
                    label="Số CCCD/CMND"
                    placeholder="Nhập số CCCD/CMND"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="phoneNumber">
                {(field) => (
                  <field.TextField
                    label="Số điện thoại"
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="email">
                {(field) => (
                  <field.TextField
                    label="Email"
                    type="email"
                    placeholder="Nhập email"
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="address">
                {(field) => (
                  <field.TextareaField
                    label="Địa chỉ thường trú"
                    placeholder="Nhập địa chỉ thường trú"
                    disabled={disabled}
                    className="sm:col-span-2"
                  />
                )}
              </form.AppField>
            </div>

            <form.Field name="avatarUrl">
              {(field) => (
                <UserAvatarField
                  value={field.state.value}
                  onChange={field.handleChange}
                  disabled={disabled}
                />
              )}
            </form.Field>
          </div>
        </div>
      </div>
    )
  },
})
