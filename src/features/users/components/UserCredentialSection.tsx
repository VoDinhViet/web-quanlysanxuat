import { Switch } from "@/components/ui/switch"
import { withForm } from "@/hooks/use-app-form"
import { CREATE_USER_DEFAULT_VALUES } from "@/features/users/schemas/create-user.schema"
import { cn } from "@/lib/utils"

export const UserCredentialSection = withForm({
  defaultValues: CREATE_USER_DEFAULT_VALUES,
  props: {
    disabled: false,
    // True when editing an employee who already has an ERP account: the
    // toggle is hidden (an existing account can't be un-granted here), the
    // fields are always shown, and the password becomes optional.
    hasExistingCredential: false,
  },
  render: function Render({ form, disabled, hasExistingCredential }) {
    return (
      <div>
        <div className="px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Tài khoản ERP
          </h2>
          <p className="text-sm text-muted-foreground">
            {hasExistingCredential
              ? "Nhân viên này đã có quyền đăng nhập hệ thống"
              : "Tùy chọn — cấp quyền đăng nhập hệ thống"}
          </p>
        </div>

        <div className="space-y-5 px-4 pb-5 sm:px-5">
          {hasExistingCredential ? null : (
            <form.Field name="credential">
              {(field) => (
                <div
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 transition-colors",
                    field.state.value
                      ? "border-primary/30 bg-primary/5"
                      : "border-input bg-muted/30"
                  )}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">
                      Cấp tài khoản ERP cho nhân viên này
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Cho phép nhân viên đăng nhập vào hệ thống quản trị
                    </p>
                  </div>
                  <Switch
                    checked={field.state.value != null}
                    onCheckedChange={(checked) =>
                      field.handleChange(
                        checked
                          ? { username: "", email: "", password: "" }
                          : undefined
                      )
                    }
                    disabled={disabled}
                    className="shrink-0"
                  />
                </div>
              )}
            </form.Field>
          )}

          <form.Subscribe
            selector={(state) =>
              hasExistingCredential || state.values.credential != null
            }
          >
            {(showFields) =>
              showFields ? (
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                  <form.AppField name="credential.username">
                    {(field) => (
                      <field.TextField
                        label="Tên đăng nhập"
                        placeholder="Nhập tên đăng nhập"
                        disabled={disabled}
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="credential.email">
                    {(field) => (
                      <field.TextField
                        label="Email đăng nhập"
                        type="email"
                        placeholder="Nhập email đăng nhập"
                        disabled={disabled}
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
                        disabled={disabled}
                      />
                    )}
                  </form.AppField>
                </div>
              ) : null
            }
          </form.Subscribe>
        </div>
      </div>
    )
  },
})
