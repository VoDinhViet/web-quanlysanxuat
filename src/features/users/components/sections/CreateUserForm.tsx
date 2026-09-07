import { useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FileText, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAutoFocusFirstField } from "@/hooks/use-autofocus-first-field"
import { useFormDraft } from "@/hooks/use-form-draft"
import { CreateUserCredentialSection } from "@/features/users/components/sections/CreateUserCredentialSection"
import { CreateUserJobInfoSection } from "@/features/users/components/sections/CreateUserJobInfoSection"
import { CreateUserInfoSection } from "@/features/users/components/sections/CreateUserInfoSection"
import {
  createUserFormDefaultValues,
  createUserSchema,
} from "@/features/users/schemas/create-user.schema"
import { createUser } from "@/features/users/api/server-functions/create-user.api"
import type { CreateUserSchema } from "@/features/users/schemas/create-user.schema"

// Trial #2 of react-hook-form (see LoginForm.tsx for trial #1) — deliberately not the pattern
// for a new form yet, see .claude/rules/forms-and-ui.md. `{ raw: true }` keeps handleSubmit's
// value un-transformed (z.input), matching what createUser's own `.validator()` re-parses.
export function CreateUserForm() {
  const navigate = useNavigate({ from: "/manage/users/create/" })
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

  const form = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema, undefined, { raw: true }),
    defaultValues: createUserFormDefaultValues,
  })

  // Auto-restore a saved draft into the form once, after localStorage hydrates.
  // Credential is not part of the draft, so it stays at its default.
  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      form.reset({ ...createUserFormDefaultValues, ...draft })
    }
  }, [draft, form])

  // react-hook-form "materializes" an unset nested object as soon as a child controller
  // mounts (it back-fills intermediate path segments — see updateValidAndValue in
  // node_modules/react-hook-form), so the 4 credential.* controllers below turn `credential`
  // from `undefined` into `{username: undefined, ...}` on mount even while the toggle is off.
  // `createCredentialSchema.optional()` only tolerates `undefined` at the top level, so that
  // object would fail validation on submit. Clear it back once, after children have mounted.
  useEffect(() => {
    form.setValue("credential", undefined)
    // `form` (the object useForm returns) keeps a stable identity across renders, so this
    // still only runs once, right after the child controllers mount.
  }, [form])

  const formRef = useAutoFocusFirstField<HTMLFormElement>()

  return (
    <form
      ref={formRef}
      onSubmit={form.handleSubmit((values) => create(values))}
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
                form.reset(createUserFormDefaultValues)
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
                  form.getValues()
                saveDraft(draftValues)
                toast.success("Đã lưu nháp")
              }}
            >
              <FileText className="size-4" />
              Lưu nháp
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || isPending}
            >
              {form.formState.isSubmitting || isPending ? (
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
          </div>
        </div>
      </section>
    </form>
  )
}
