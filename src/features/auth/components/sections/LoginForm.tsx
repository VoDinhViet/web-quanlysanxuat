import { useState } from "react"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { revalidateLogic } from "@tanstack/react-form"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAppForm } from "@/hooks/use-app-form"
import { loginWithEmailPassword } from "@/features/auth/api/server-functions/login-with-email-password.api"
import { loginSchema } from "@/features/auth/schemas/login.schema"
import { resolveInternalRedirect } from "@/lib/redirect"
import type { LoginSchema } from "@/features/auth/schemas/login.schema"

export function LoginForm() {
  const { redirectTo } = useSearch({ from: "/(auth)/login" })
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)

  const loginWithEmailPasswordFn = useServerFn(loginWithEmailPassword)

  const { mutate: login, isPending } = useMutation({
    mutationFn: (value: LoginSchema) =>
      loginWithEmailPasswordFn({ data: value }),
    onSuccess: async () => {
      // The QueryClient outlives a logout/login cycle, so a previous user's cache can
      // still be fresh (staleTime 60s) — wipe it before the guard below re-reads the
      // profile, or the new user inherits the old user's permissions and list data.
      queryClient.clear()
      // The session cookie only exists after the server function resolves, so the
      // (authed) guard must re-run against it before we navigate into that layout.
      await router.invalidate()
      await navigate({ href: resolveInternalRedirect(redirectTo) })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: {
      identifier: "",
      password: "",
      keepSignedIn: false,
    },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: loginSchema },
    onSubmit: ({ value }) => login(value),
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
          if (form.state.isSubmitting) return
          form.handleSubmit()
        }}
        noValidate
        className="space-y-6"
      >
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
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                      className="h-12 pr-11"
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
                  onCheckedChange={(checked) => field.handleChange(checked)}
                  onBlur={field.handleBlur}
                  disabled={isPending}
                />
                <FieldLabel
                  htmlFor={field.name}
                  className="cursor-pointer text-sm font-normal text-muted-foreground hover:text-foreground"
                >
                  Ghi nhớ đăng nhập
                </FieldLabel>
              </Field>
            )}
          </form.Field>

          <Button
            type="submit"
            size="lg"
            className="h-13 w-full text-base font-semibold tracking-[0.04em]"
            disabled={isPending}
          >
            {isPending ? (
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
        </FieldGroup>
      </form>
    </div>
  )
}
