import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { RolePermissionsField } from "@/features/roles/components/composites/RolePermissionsField"
import { updateRole } from "@/features/roles/api/server-functions/update-role.api"
import { updateRoleSchema } from "@/features/roles/schemas/update-role.schema"
import type { UpdateRoleSchema } from "@/features/roles/schemas/update-role.schema"
import type { PermissionCode } from "@/lib/types/permission.type"
import type { Role } from "@/lib/types/role.type"

function getRoleDefaultValues(role: Role): UpdateRoleSchema {
  return {
    roleId: role.id,
    code: role.code,
    name: role.name,
    description: role.description ?? "",
    // `Role.permissions` is `string[]` off the wire (same reasoning as `hasPermission`'s
    // `granted: string[]` — the type checker can't know it only holds real codes), but
    // `RolesService.validatePermissionCodes` on the backend guarantees every value already is
    // one before it's ever written.
    permissions: role.permissions as PermissionCode[],
  }
}

type UpdateRoleFormProps = {
  role: Role
}

export function UpdateRoleForm({ role }: UpdateRoleFormProps) {
  const navigate = useNavigate({ from: "/manage/roles/$roleId/update" })
  const queryClient = useQueryClient()
  const updateRoleFn = useServerFn(updateRole)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateRoleSchema) => updateRoleFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roles"] })
      await queryClient.invalidateQueries({ queryKey: ["auth", "permissions"] })
      await navigate({ to: "/manage/roles" })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getRoleDefaultValues(role),
    validators: {
      onSubmit: updateRoleSchema,
    },
    onSubmit: ({ value }) => update(value),
  })

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
                placeholder="Nhập mã vai trò"
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

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => void navigate({ to: "/manage/roles" })}
          >
            Hủy
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
                    Lưu thay đổi
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  )
}
