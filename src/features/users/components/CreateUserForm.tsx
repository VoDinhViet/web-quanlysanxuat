import { useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FileText, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { useAutoFocusFirstField } from "@/hooks/use-autofocus-first-field"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { CreateUserCredentialSection } from "@/features/users/components/CreateUserCredentialSection"
import { CreateUserJobInfoSection } from "@/features/users/components/CreateUserJobInfoSection"
import { CreateUserInfoSection } from "@/features/users/components/CreateUserInfoSection"
import {
  createUserFormDefaultValues,
  createUserSchema,
} from "@/features/users/schemas/create-user.schema"
import { createUser } from "@/features/users/api/server-functions/create-user.api"
import type { CreateUserSchema } from "@/features/users/schemas/create-user.schema"

export function CreateUserForm() {
  const navigate = useNavigate({ from: "/manage/users/create" })
  const queryClient = useQueryClient()
  const createUserFn = useServerFn(createUser)

  // The credential (password) is never persisted — only non-secret draft fields.
  const { draft, saveDraft, clearDraft } = useFormDraft<
    Omit<CreateUserSchema, "credential">
  >("qlsx:draft:create-user")
  const draftRestoredRef = useRef(false)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateUserSchema) => createUserFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["users"] })
      await navigate({ to: "/manage/users", search: { page: 1, limit: 10 } })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createUserFormDefaultValues,
    validators: {
      onSubmit: createUserSchema,
    },
    onSubmit: ({ value }) => create(value),
  })

  // Auto-restore a saved draft into the form once, after localStorage hydrates.
  // Credential is not part of the draft, so it stays at its default.
  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      restoreFormDraft(form, { ...createUserFormDefaultValues, ...draft })
    }
  }, [draft, form])

  const formRef = useAutoFocusFirstField<HTMLFormElement>()

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
      className="space-y-6"
    >
      <section className="overflow-hidden rounded-lg bg-card shadow-card">
        <CreateUserInfoSection form={form} disabled={isPending} />
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <CreateUserJobInfoSection form={form} disabled={isPending} />
          <CreateUserCredentialSection form={form} disabled={isPending} />
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
                restoreFormDraft(form, createUserFormDefaultValues)
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
