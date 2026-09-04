import { useState } from "react"
import { Controller, useWatch } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { rolesQueryOptions } from "@/features/roles/api"
import { buildSelectOptions } from "@/lib/utils"
import type { CreateUserSchema } from "@/features/users/schemas/create-user.schema"

type CreateUserCredentialSectionProps = {
  form: UseFormReturn<CreateUserSchema>
  disabled: boolean
}

// Each field is a plain <Controller> render-prop, same idiom as LoginForm.tsx — no shared RHF
// field kit, kept deliberately simple for a form still under trial (see forms-and-ui.md).
export function CreateUserCredentialSection({
  form,
  disabled,
}: CreateUserCredentialSectionProps) {
  const [showPassword, setShowPassword] = useState(false)

  // `GET /roles` đòi `roles:read`, còn trang này chỉ đòi `users:create` — không thể prefetch
  // ở loader (thiếu quyền sẽ làm sập cả trang qua errorComponent chung). `useQuery` để thiếu
  // quyền chỉ làm rỗng combobox Vai trò, vốn đã optional.
  const rolesQuery = useQuery(rolesQueryOptions())
  const roles = rolesQuery.data ?? []
  const roleOptions = buildSelectOptions(roles)

  // Fields stay on screen when the toggle is off so the section keeps its shape — they're
  // just inert. `credential` is undefined then (see CreateUserForm's mount effect), so an
  // untoggled account still submits as "no account".
  const credentialEnabled =
    useWatch({ control: form.control, name: "credential" }) != null
  const fieldsDisabled = disabled || !credentialEnabled

  return (
    <div>
      <div className="flex items-start justify-between gap-3 px-4 py-4 sm:px-5">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Tài khoản ERP
          </h2>
          <p className="text-sm text-muted-foreground">
            Tùy chọn — cho phép nhân viên đăng nhập hệ thống
          </p>
        </div>

        <Controller
          control={form.control}
          name="credential"
          render={({ field }) => (
            <Switch
              isSelected={field.value != null}
              onChange={(checked) =>
                field.onChange(
                  checked
                    ? { username: "", email: "", password: "", roleId: "" }
                    : undefined
                )
              }
              isDisabled={disabled}
              className="mt-1 shrink-0"
              aria-label="Cấp tài khoản ERP cho nhân viên này"
            />
          )}
        />
      </div>

      <div className="space-y-5 px-4 pb-5 sm:px-5">
        <Controller
          control={form.control}
          name="credential.username"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                Tên đăng nhập
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                id={field.name}
                placeholder="Nhập tên đăng nhập"
                className="h-9 bg-background text-xs"
                aria-invalid={!!fieldState.error}
                disabled={fieldsDisabled}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="credential.email"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                Email đăng nhập
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                id={field.name}
                type="email"
                placeholder="Nhập email đăng nhập"
                className="h-9 bg-background text-xs"
                aria-invalid={!!fieldState.error}
                disabled={fieldsDisabled}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="credential.password"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                Mật khẩu
              </FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  value={field.value ?? ""}
                  id={field.name}
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  autoComplete="new-password"
                  className="h-9 bg-background pr-9 text-xs"
                  aria-invalid={!!fieldState.error}
                  disabled={fieldsDisabled}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                  onPress={() => setShowPassword(!showPassword)}
                  isDisabled={fieldsDisabled}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="credential.roleId"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel
                htmlFor={field.name}
                className="text-xs font-medium text-foreground"
              >
                Vai trò
              </FieldLabel>
              <Select
                selectedKey={field.value ?? ""}
                onSelectionChange={(key) => field.onChange(String(key))}
                isDisabled={fieldsDisabled}
                placeholder={
                  rolesQuery.isPending
                    ? "Đang tải..."
                    : "Chọn vai trò (tuỳ chọn)"
                }
              >
                <SelectTrigger
                  id={field.name}
                  onBlur={field.onBlur}
                  aria-invalid={!!fieldState.error}
                  className="h-9 w-full bg-background text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      id={option.value}
                      className="text-xs"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
    </div>
  )
}
