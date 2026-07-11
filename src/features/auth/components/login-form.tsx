import { Activity, useState, useTransition } from "react"
import { useForm } from "@tanstack/react-form"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { AlertOctagon, Loader2, LogIn } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { LoginEmailField } from "@/features/auth/components/login-email-field"
import { LoginFormHeader } from "@/features/auth/components/login-form-header"
import { LoginKeepSignedInField } from "@/features/auth/components/login-keep-signed-in-field"
import { LoginPasswordField } from "@/features/auth/components/login-password-field"
import { loginWithEmailPassword } from "@/features/auth/server-functions/login-with-email-password"
import { loginSchema } from "@/features/auth/schemas/login.schema"
import { resolveInternalRedirect } from "@/lib/redirect"
import type { LoginSchema } from "@/features/auth/schemas/login.schema"

export function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const { redirectTo } = useSearch({ from: "/(auth)/login" })
  const navigate = useNavigate()
  const router = useRouter()

  const loginWithEmailPasswordFn = useServerFn(loginWithEmailPassword)

  const handleSubmit = (value: LoginSchema) => {
    setError(null)

    startTransition(async () => {
      const result = await loginWithEmailPasswordFn({ data: value })

      if (!result.success) {
        setError(result.message)
        return
      }

      // The session cookie only exists after the server function resolves, so the
      // (authed) guard must re-run against it before we navigate into that layout.
      await router.invalidate()
      await navigate({ href: resolveInternalRedirect(redirectTo) })
    })
  }

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
      <LoginFormHeader />

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
            {(field) => (
              <LoginEmailField
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
