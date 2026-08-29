import { useState } from "react"
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
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
import { loginWithEmailPassword } from "@/features/auth/api/server-functions/login-with-email-password.api"
import { loginSchema } from "@/features/auth/schemas/login.schema"
import { resolveInternalRedirect } from "@/lib/redirect"
import type { LoginSchema } from "@/features/auth/schemas/login.schema"

// Ngoại lệ có chủ ý: form này dùng react-hook-form + `Field` (ui/field.tsx) thay vì
// TanStack Form + `useAppForm` mà mọi form khác trong repo dùng — bản thử nghiệm, xem
// .claude/rules/forms-and-ui.md.
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

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      keepSignedIn: false,
    },
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
        onSubmit={form.handleSubmit((value) => login(value))}
        noValidate
        className="space-y-6"
      >
        <FieldGroup className="gap-6">
          <Controller
            control={form.control}
            name="identifier"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
                >
                  Email hoặc tên đăng nhập
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  placeholder="Nhập email hoặc tên đăng nhập"
                  autoComplete="username"
                  autoFocus
                  className="h-12"
                  aria-invalid={!!fieldState.error}
                  disabled={isPending}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
                >
                  Mật khẩu
                </FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    id={field.name}
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    className="h-12 pr-11"
                    aria-invalid={!!fieldState.error}
                    disabled={isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="keepSignedIn"
            render={({ field }) => (
              <Field orientation="horizontal">
                <Checkbox
                  id={field.name}
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={(value) => field.onChange(value === true)}
                  onBlur={field.onBlur}
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
          />

          <Button
            type="submit"
            size="lg"
            className="h-13 w-full text-base font-semibold tracking-[0.04em]"
            disabled={form.formState.isSubmitting || isPending}
          >
            {form.formState.isSubmitting || isPending ? (
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
