import { Activity, useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertOctagon, FileText, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { UserCredentialSection } from "@/features/users/components/UserCredentialSection"
import { CreateUserJobInfoSection } from "@/features/users/components/CreateUserJobInfoSection"
import { CreateUserInfoSection } from "@/features/users/components/CreateUserInfoSection"
import {
  CREATE_USER_DEFAULT_VALUES,
  createUserSchema,
} from "@/features/users/schemas/create-user.schema"
import { createUser } from "@/features/users/server-functions/create-user"
import type { CreateUserSchema } from "@/features/users/schemas/create-user.schema"
import type {
  DepartmentOption,
  PositionOption,
  RoleOption,
} from "@/features/users/types/user.type"

type CreateUserFormProps = {
  departments: DepartmentOption[]
  positions: PositionOption[]
  roles: RoleOption[]
}

export function CreateUserForm({
  departments,
  positions,
  roles,
}: CreateUserFormProps) {
  const navigate = useNavigate({ from: "/manage/users/create" })
  const queryClient = useQueryClient()
  const createUserFn = useServerFn(createUser)

  // The credential (password) is never persisted — only non-secret draft fields.
  const { draft, saveDraft, clearDraft } = useFormDraft<
    Omit<CreateUserSchema, "credential">
  >("qlsx:draft:create-user")
  const draftRestoredRef = useRef(false)

  const createUserMutation = useMutation({
    mutationFn: (value: CreateUserSchema) => createUserFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["users"] })
      await navigate({ to: "/manage/users", search: { page: 1, limit: 10 } })
    },
  })

  const isPending = createUserMutation.isPending
  const error = createUserMutation.error?.message ?? null

  const form = useAppForm({
    defaultValues: CREATE_USER_DEFAULT_VALUES,
    validators: {
      onSubmit: createUserSchema,
    },
    onSubmit: ({ value }) => createUserMutation.mutate(value),
  })

  // Auto-restore a saved draft into the form once, after localStorage hydrates.
  // Credential is not part of the draft, so it stays at its default.
  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      restoreFormDraft(form, { ...CREATE_USER_DEFAULT_VALUES, ...draft })
    }
  }, [draft, form])

  return (
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

      <section className="overflow-hidden rounded-lg bg-card shadow-card">
        <CreateUserInfoSection form={form} disabled={isPending} />
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <CreateUserJobInfoSection
            form={form}
            disabled={isPending}
            departments={departments}
            positions={positions}
          />
          <UserCredentialSection
            form={form}
            disabled={isPending}
            roles={roles}
            hasExistingCredential={false}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            disabled={isPending}
            onClick={() =>
              void navigate({
                to: "/manage/users",
                search: { page: 1, limit: 10 },
              })
            }
          >
            Hủy
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                form.reset()
                restoreFormDraft(form, CREATE_USER_DEFAULT_VALUES)
                clearDraft()
              }}
            >
              <RotateCcw className="size-4" />
              Đặt lại
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                const { credential: _credential, ...draftValues } =
                  form.state.values
                saveDraft(draftValues)
                toast.success("Đã lưu nháp")
              }}
            >
              <FileText className="size-4" />
              Lưu nháp
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || isPending}
                >
                  {isSubmitting || isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Đang lưu
                    </>
                  ) : (
                    <>
                      <Save />
                      Lưu nhân viên
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </section>
    </form>
  )
}
