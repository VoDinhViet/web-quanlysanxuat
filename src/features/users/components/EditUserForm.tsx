import { Activity } from "react"
import { DateTime } from "luxon"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertOctagon, Loader2, Save } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { CreateUserJobInfoSection } from "@/features/users/components/CreateUserJobInfoSection"
import { CreateUserInfoSection } from "@/features/users/components/CreateUserInfoSection"
import { UserCredentialSection } from "@/features/users/components/UserCredentialSection"
import { createUserSchema } from "@/features/users/schemas/create-user.schema"
import { editUserWithCredentialSchema } from "@/features/users/schemas/update-user.schema"
import { updateUser } from "@/features/users/server-functions/update-user"
import type { CreateUserSchema } from "@/features/users/schemas/create-user.schema"
import type {
  DepartmentOption,
  PositionOption,
  RoleOption,
  User,
} from "@/features/users/types/user.type"

// User → raw form values: nullable fields become "", ISO datetimes become the
// yyyy-MM-dd strings the date pickers work with. When the employee already
// has an ERP account, its username/email are prefilled and editable, with
// password left blank (blank = keep the current password).
function buildDefaultValues(user: User): CreateUserSchema {
  const credential = user.credential
    ? {
        username: user.credential.username,
        email: user.credential.email,
        password: "",
        roleId: user.credential.role?.id ?? "",
      }
    : undefined

  return {
    fullName: user.fullName,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth
      ? DateTime.fromISO(user.dateOfBirth).toFormat("yyyy-MM-dd")
      : "",
    idNumber: user.idNumber ?? "",
    phoneNumber: user.phoneNumber ?? "",
    email: user.email ?? "",
    address: user.address ?? "",
    avatar: user.avatar,
    departmentId: user.department.id,
    positionId: user.position.id,
    hireDate: DateTime.fromISO(user.hireDate).toFormat("yyyy-MM-dd"),
    note: user.note ?? "",
    status: user.status,
    credential,
  }
}

type EditUserFormProps = {
  myUser: User
  departments: DepartmentOption[]
  positions: PositionOption[]
  roles: RoleOption[]
}

export function EditUserForm({
  myUser,
  departments,
  positions,
  roles,
}: EditUserFormProps) {
  const navigate = useNavigate({ from: "/manage/users/$userId/edit" })
  const queryClient = useQueryClient()
  const updateUserFn = useServerFn(updateUser)

  const {
    mutate: update,
    isPending,
    error,
  } = useMutation({
    mutationFn: (value: CreateUserSchema) =>
      updateUserFn({ data: { ...value, userId: myUser.id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] })
      await navigate({ to: "/manage/users", search: { page: 1, limit: 10 } })
    },
  })

  const form = useAppForm({
    defaultValues: buildDefaultValues(myUser),
    validators: {
      onSubmit: myUser.credential
        ? editUserWithCredentialSchema
        : createUserSchema,
    },
    onSubmit: ({ value }) => update(value),
  })

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
          <AlertTitle>{error?.message}</AlertTitle>
        </Alert>
      </Activity>

      <section className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
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
            hasExistingCredential={myUser.credential != null}
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="outline"
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
      </section>
    </form>
  )
}
