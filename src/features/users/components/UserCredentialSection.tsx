import { Switch } from "@/components/ui/switch"
import { withForm } from "@/hooks/use-app-form"
import { USER_FORM_DEFAULT_VALUES } from "@/features/users/schemas/user-form.schema"
import type { RoleOption } from "@/features/users/types/user.type"
import { buildSelectOptions } from "@/lib/utils"

export const UserCredentialSection = withForm({
  defaultValues: USER_FORM_DEFAULT_VALUES,
  props: {
    disabled: false,
    // True when editing an employee who already has an ERP account: the
    // toggle is hidden (an existing account can't be un-granted here), the
    // fields are always shown, and the password becomes optional.
    hasExistingCredential: false,
    roles: [] as RoleOption[],
  },
  render: function Render({ form, disabled, hasExistingCredential, roles }) {
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

          {hasExistingCredential ? null : (
            <form.Field name="credential">
              {(field) => (
                <Switch
                  checked={field.state.value != null}
                  onCheckedChange={(checked) =>
                    field.handleChange(
                      checked
                        ? { username: "", email: "", password: "", roleId: "" }
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
          {(credentialEnabled) => {
            // Fields stay on screen when the toggle is off so the section keeps
            // its shape — they're just inert. `credential` is undefined then, and
            // mounting a field never writes to form state (only a `defaultValue`
            // prop does), so an untoggled account still submits as "no account".
            const fieldsDisabled = disabled || !credentialEnabled

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
                      required
                      placeholder="Chọn vai trò"
                      options={buildSelectOptions(roles)}
                      disabled={fieldsDisabled}
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
