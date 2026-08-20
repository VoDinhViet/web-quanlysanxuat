import { useQuery } from "@tanstack/react-query"

import { Switch } from "@/components/ui/switch"
import { withForm } from "@/hooks/use-app-form"
import { rolesQueryOptions } from "@/features/users/api/options"
import { updateUserFormDefaultValues } from "@/features/users/schemas/update-user.schema"
import { buildSelectOptions } from "@/lib/utils"

export const UpdateUserCredentialSection = withForm({
  defaultValues: updateUserFormDefaultValues,
  props: {
    disabled: false,
    // True when editing an employee who already has an ERP account: the
    // toggle is hidden (an existing account can't be un-granted here), the
    // fields are always shown, and the password becomes optional.
    hasExistingCredential: false,
  },
  render: function Render({ form, disabled, hasExistingCredential }) {
    // `GET /roles` đòi `roles:read`, còn trang này chỉ đòi `users:update` — không thể prefetch
    // ở loader (thiếu quyền sẽ làm sập cả trang qua errorComponent chung). `useQuery` để thiếu
    // quyền chỉ làm rỗng combobox Vai trò, vốn đã optional.
    const rolesQuery = useQuery(rolesQueryOptions())
    const roles = rolesQuery.data ?? []

    return (
      <div>
        <div className="flex items-start justify-between gap-3 px-4 py-4 sm:px-5">
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Tài khoản ERP
            </h2>
            <p className="text-sm text-muted-foreground">
              {hasExistingCredential
                ? "Nhân viên này đã có quyền đăng nhập hệ thống"
                : "Tùy chọn — cho phép nhân viên đăng nhập hệ thống"}
            </p>
          </div>

          {hasExistingCredential ? (
            <form.Field name="credential.credentialEnabled">
              {(field) => (
                <Switch
                  checked={field.state.value}
                  onCheckedChange={field.handleChange}
                  disabled={disabled}
                  className="mt-1 shrink-0"
                  aria-label="Cho phép đăng nhập"
                />
              )}
            </form.Field>
          ) : (
            <form.Field name="credential">
              {(field) => (
                <Switch
                  checked={field.state.value != null}
                  onCheckedChange={(checked) =>
                    field.handleChange(
                      checked
                        ? {
                            username: "",
                            email: "",
                            password: "",
                            roleId: "",
                            credentialEnabled: true,
                          }
                        : undefined
                    )
                  }
                  disabled={disabled}
                  className="mt-1 shrink-0"
                  aria-label="Cấp tài khoản ERP cho nhân viên này"
                />
              )}
            </form.Field>
          )}
        </div>

        <form.Subscribe
          selector={(state) =>
            hasExistingCredential || state.values.credential != null
          }
        >
          {(showCredentialFields) => {
            // Fields stay on screen when the toggle is off so the section keeps
            // its shape — they're just inert. `credential` is undefined then, and
            // mounting a field never writes to form state (only a `defaultValue`
            // prop does), so an untoggled account still submits as "no account".
            const fieldsDisabled = disabled || !showCredentialFields

            return (
              <div className="space-y-5 px-4 pb-5 sm:px-5">
                <form.AppField name="credential.username">
                  {(field) => (
                    <field.TextField
                      label="Tên đăng nhập"
                      placeholder="Nhập tên đăng nhập"
                      disabled={fieldsDisabled}
                    />
                  )}
                </form.AppField>

                <form.AppField name="credential.email">
                  {(field) => (
                    <field.TextField
                      label="Email đăng nhập"
                      type="email"
                      placeholder="Nhập email đăng nhập"
                      disabled={fieldsDisabled}
                    />
                  )}
                </form.AppField>

                <form.AppField name="credential.password">
                  {(field) => (
                    <field.PasswordField
                      label={
                        hasExistingCredential ? "Mật khẩu mới" : "Mật khẩu"
                      }
                      placeholder={
                        hasExistingCredential
                          ? "Để trống nếu không đổi mật khẩu"
                          : "Nhập mật khẩu"
                      }
                      disabled={fieldsDisabled}
                    />
                  )}
                </form.AppField>

                <form.AppField name="credential.roleId">
                  {(field) => (
                    <field.SelectField
                      label="Vai trò"
                      placeholder="Chọn vai trò (tuỳ chọn)"
                      options={buildSelectOptions(roles)}
                      disabled={fieldsDisabled}
                      isPending={rolesQuery.isPending}
                    />
                  )}
                </form.AppField>
              </div>
            )
          }}
        </form.Subscribe>
      </div>
    )
  },
})
