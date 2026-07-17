import { Activity } from "react"
import { useForm } from "@tanstack/react-form"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { AlertOctagon, Loader2, LogIn } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LoginKeepSignedInField } from "@/features/auth/components/LoginKeepSignedInField"
import { LoginPasswordField } from "@/features/auth/components/LoginPasswordField"
import { loginWithEmailPassword } from "@/features/auth/server-functions/login-with-email-password"
import { loginSchema } from "@/features/auth/schemas/login.schema"
import { resolveInternalRedirect } from "@/lib/redirect"
import type { LoginSchema } from "@/features/auth/schemas/login.schema"

export function LoginForm() {
  const { redirectTo } = useSearch({ from: "/(auth)/login" })
  const navigate = useNavigate()
  const router = useRouter()

  const loginWithEmailPasswordFn = useServerFn(loginWithEmailPassword)

  const loginMutation = useMutation({
    mutationFn: (value: LoginSchema) =>
      loginWithEmailPasswordFn({ data: value }),
    onSuccess: async () => {
      // The session cookie only exists after the server function resolves, so the
      // (authed) guard must re-run against it before we navigate into that layout.
      await router.invalidate()
      await navigate({ href: resolveInternalRedirect(redirectTo) })
    },
  })

  const isPending = loginMutation.isPending
  const error = loginMutation.error?.message ?? null

  const form = useForm({
    defaultValues: {
      identifier: "",
      password: "",
      keepSignedIn: false,
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: ({ value }) => loginMutation.mutate(value),
  })

  return (
    <div>
      <div className="mb-9">
        <p className="mb-3.5 text-xs font-bold tracking-[0.2em] text-primary uppercase">
          Cổng xác thực
        </p>
        <h1 className="text-[40px] font-extrabold tracking-tight text-foreground">
          Chào mừng trở lại
        </h1>
        <p className="mt-3.5 text-base leading-[1.55] text-muted-foreground">
          Đăng nhập tài khoản để truy cập hệ thống quản lý sản xuất.
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

        <FieldGroup className="gap-6">
          <form.Field name="identifier">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && field.state.meta.errors.length > 0

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
                  >
                    Email hoặc tên đăng nhập
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    placeholder="Nhập email hoặc tên đăng nhập"
                    autoComplete="username"
                    autoFocus
                    className="h-12"
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
            {(field) => (
              <LoginPasswordField
                name={field.name}
                value={field.state.value}
                errors={field.state.meta.errors}
                isInvalid={
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                }
                disabled={isPending}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
              />
            )}
          </form.Field>

          <form.Field name="keepSignedIn">
            {(field) => (
              <LoginKeepSignedInField
                name={field.name}
                checked={field.state.value}
                disabled={isPending}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
              />
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                size="lg"
                className="h-13 w-full text-base font-semibold tracking-[0.04em]"
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
