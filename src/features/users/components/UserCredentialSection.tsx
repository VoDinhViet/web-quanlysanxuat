import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { CreateUserPasswordField } from "@/features/users/components/create-user-password-field"
import type { CreateUserFormApi } from "@/features/users/components/create-user-form"
import { CreateUserTextField } from "@/features/users/components/create-user-text-field"
import { cn } from "@/lib/utils"

type CreateUserAccountSectionProps = {
  form: CreateUserFormApi
  disabled: boolean
}

export function CreateUserAccountSection({
  form,
  disabled,
}: CreateUserAccountSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-bold tracking-wide text-primary uppercase">
          3. Tài khoản ERP (tùy chọn)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <form.Field name="accountEnabled">
          {(field) => (
            <label className="flex w-fit cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
              <Checkbox
                checked={field.state.value}
                onCheckedChange={(value) => field.handleChange(value === true)}
                disabled={disabled}
              />
              Cấp tài khoản ERP cho nhân viên này
            </label>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.accountEnabled}>
          {(accountEnabled) => (
            <div
              className={cn(
                "grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-5 lg:items-start",
                !accountEnabled && "opacity-50"
              )}
            >
              <form.Field name="accountUsername">
                {(field) => (
                  <CreateUserTextField
                    id={field.name}
                    label="Tên đăng nhập"
                    placeholder="Nhập tên đăng nhập"
                    value={field.state.value}
                    errors={field.state.meta.errors}
                    isInvalid={
                      field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0
                    }
                    disabled={disabled || !accountEnabled}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                  />
                )}
              </form.Field>

              <form.Field name="accountEmail">
                {(field) => (
                  <CreateUserTextField
                    id={field.name}
                    label="Email đăng nhập"
                    type="email"
                    placeholder="Nhập email đăng nhập"
                    value={field.state.value}
                    errors={field.state.meta.errors}
                    isInvalid={
                      field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0
                    }
                    disabled={disabled || !accountEnabled}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                  />
                )}
              </form.Field>

              <form.Field name="accountPassword">
                {(field) => (
                  <CreateUserPasswordField
                    id={field.name}
                    label="Mật khẩu"
                    placeholder="Nhập mật khẩu"
                    value={field.state.value}
                    errors={field.state.meta.errors}
                    isInvalid={
                      field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0
                    }
                    disabled={disabled || !accountEnabled}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                  />
                )}
              </form.Field>

              <form.Field name="accountConfirmPassword">
                {(field) => (
                  <CreateUserPasswordField
                    id={field.name}
                    label="Xác nhận mật khẩu"
                    placeholder="Nhập lại mật khẩu"
                    value={field.state.value}
                    errors={field.state.meta.errors}
                    isInvalid={
                      field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0
                    }
                    disabled={disabled || !accountEnabled}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                  />
                )}
              </form.Field>

              <form.Field name="accountActive">
                {(field) => (
                  <div className="space-y-1.5">
                    <span className="block text-xs font-medium text-foreground">
                      Trạng thái hoạt động
                    </span>
                    <label className="flex h-9 cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
                      <Switch
                        checked={field.state.value}
                        onCheckedChange={field.handleChange}
                        disabled={disabled || !accountEnabled}
                      />
                      {field.state.value ? "Hoạt động" : "Không hoạt động"}
                    </label>
                  </div>
                )}
              </form.Field>
            </div>
          )}
        </form.Subscribe>
      </CardContent>
    </Card>
  )
}
