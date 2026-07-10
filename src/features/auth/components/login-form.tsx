import * as React from "react"
import { Activity, useTransition } from "react"
import { useForm } from "@tanstack/react-form"
import { useSearch } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { AlertOctagon, Eye, EyeOff, Loader2, LogIn } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { loginWithEmailPassword } from "@/features/auth/server-functions/login-with-email-password"
import { loginSchema } from "@/features/auth/schemas/login.schema"
import type { LoginSchema } from "@/features/auth/schemas/login.schema"

export function LoginForm() {
  // ---------------------------------------LOCAL STATE---------------------------------
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // ---------------------------------------ROUTE STATE---------------------------------
  const { redirectTo } = useSearch({ from: "/(auth)/login" })

  // ---------------------------------------SERVER ACTIONS---------------------------------
  const loginWithEmailPasswordFn = useServerFn(loginWithEmailPassword)

  // ---------------------------------------HANDLERS---------------------------------
  const handleSubmit = (value: LoginSchema) => {
    setError(null)

    startTransition(async () => {
      const result = await loginWithEmailPasswordFn({
        data: { ...value, redirectTo },
      })

      if (!result.success) {
        setError(result.message)
      }
    })
  }

  // ---------------------------------------FORM SETUP---------------------------------
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      keepSignedIn: false,
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: ({ value }) => handleSubmit(value),
  })

  return (
    <div>
      <div className="mb-10">
        <div className="mb-2 flex items-end gap-4">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Cổng xác thực
          </p>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Đăng nhập
        </h1>
        <p className="mt-4 text-base leading-6 text-muted-foreground">
          Xác thực tài khoản để truy cập hệ thống quản lý sản xuất.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
        noValidate
        className="space-y-6"
      >
        <Activity mode={error ? "visible" : "hidden"}>
          <Alert className="border-destructive/20 bg-destructive/10 text-destructive">
            <AlertOctagon className="size-4" />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        </Activity>

        <FieldGroup className="gap-5">
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && field.state.meta.errors.length > 0

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
                  >
                    Email
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="Nhập email"
                    autoComplete="email"
                    className="h-12 pr-10"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    disabled={isPending}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && field.state.meta.errors.length > 0

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
                  >
                    Mật khẩu
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-12 pr-10"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                      disabled={isPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-1/2 right-2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="keepSignedIn">
            {(field) => (
              <Field orientation="horizontal">
                <Checkbox
                  id={field.name}
                  name={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(checked === true)
                  }
                  onBlur={field.handleBlur}
                  disabled={isPending}
                />
                <FieldLabel
                  htmlFor={field.name}
                  className="cursor-pointer text-sm font-normal text-muted-foreground hover:text-foreground"
                >
                  Ghi nhớ phiên đăng nhập
                </FieldLabel>
              </Field>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                size="lg"
                className="h-12 w-full tracking-widest uppercase"
                disabled={!canSubmit || isSubmitting || isPending}
              >
                {isSubmitting || isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Đang đăng nhập
                  </>
                ) : (
                  <>
                    Đăng nhập hệ thống
                    <LogIn />
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </FieldGroup>
      </form>
    </div>
  )
}
