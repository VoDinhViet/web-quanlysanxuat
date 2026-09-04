import { useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FileText, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { RolePermissionsField } from "@/features/roles/components/composites/RolePermissionsField"
import { createRole } from "@/features/roles/api/server-functions/create-role.api"
import {
  createRoleFormDefaultValues,
  createRoleSchema,
} from "@/features/roles/schemas/create-role.schema"
import type { CreateRoleSchema } from "@/features/roles/schemas/create-role.schema"

export function CreateRoleForm() {
  const navigate = useNavigate({ from: "/manage/roles/create" })
  const queryClient = useQueryClient()
  const createRoleFn = useServerFn(createRole)

  const { draft, saveDraft, clearDraft } = useFormDraft<CreateRoleSchema>(
    "qlsx:draft:create-role"
  )
  const draftRestoredRef = useRef(false)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateRoleSchema) => createRoleFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["roles"] })
      await navigate({ to: "/manage/roles" })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createRoleFormDefaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createRoleSchema,
    },
    onSubmit: ({ value }) => create(value),
  })

  // Auto-restore a saved draft into the form once, after localStorage hydrates.
  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      restoreFormDraft(form, draft)
    }
  }, [draft, form])

  return (
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
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <div className="px-4 py-4 sm:px-5">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Thông tin chung
          </h2>
          <p className="text-sm text-muted-foreground">
            Mã, tên và mô tả của vai trò
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-4 pb-5 sm:grid-cols-2 sm:px-5">
          <form.AppField name="code">
            {(field) => (
              <field.TextField
                label="Mã vai trò"
                required
                placeholder="Nhập mã vai trò, vd. QC2"
                disabled={isPending}
              />
            )}
          </form.AppField>

          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Tên vai trò"
                required
                placeholder="Nhập tên vai trò"
                disabled={isPending}
              />
            )}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <field.TextareaField
                label="Mô tả"
                placeholder="Nhập mô tả (nếu có)"
                disabled={isPending}
                className="sm:col-span-2"
              />
            )}
          </form.AppField>
        </div>

        <div className="px-4 pb-5 sm:px-5">
          <RolePermissionsField form={form} disabled={isPending} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            isDisabled={isPending}
            onPress={() => void navigate({ to: "/manage/roles" })}
          >
            Hủy
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              isDisabled={isPending}
              onPress={() => {
                form.reset()
                restoreFormDraft(form, createRoleFormDefaultValues)
                clearDraft()
              }}
            >
              <RotateCcw className="size-4" />
              Đặt lại
            </Button>
            <Button
              type="button"
              variant="outline"
              isDisabled={isPending}
              onPress={() => {
                saveDraft(form.state.values)
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
                  isDisabled={!canSubmit || isSubmitting || isPending}
                >
                  {isSubmitting || isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Đang lưu
                    </>
                  ) : (
                    <>
                      <Save />
                      Lưu vai trò
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </div>
    </form>
  )
}
