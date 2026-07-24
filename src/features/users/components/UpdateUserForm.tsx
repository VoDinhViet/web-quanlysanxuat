import { Activity } from "react"
import { DateTime } from "luxon"
import { Link, useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertOctagon, ArrowLeft, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { UserJobInfoSection } from "@/features/users/components/UserJobInfoSection"
import { UserInfoSection } from "@/features/users/components/UserInfoSection"
import { UserCredentialSection } from "@/features/users/components/UserCredentialSection"
import { userFormSchema } from "@/features/users/schemas/user-form.schema"
import { updateUserWithCredentialSchema } from "@/features/users/schemas/update-user.schema"
import { updateUser } from "@/features/users/server-functions/update-user"
import type { UserFormSchema } from "@/features/users/schemas/user-form.schema"
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
function buildDefaultValues(user: User): UserFormSchema {
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

type UpdateUserFormProps = {
  myUser: User
  departments: DepartmentOption[]
  positions: PositionOption[]
  roles: RoleOption[]
}

export function UpdateUserForm({
  myUser,
  departments,
  positions,
  roles,
}: UpdateUserFormProps) {
  const navigate = useNavigate({ from: "/manage/users/$userId/update" })
  const queryClient = useQueryClient()
  const updateUserFn = useServerFn(updateUser)

  const {
    mutate: update,
    isPending,
    error,
  } = useMutation({
    mutationFn: (value: UserFormSchema) =>
      updateUserFn({ data: { ...value, userId: myUser.id } }),
    // Stay on the page: editing an employee is often several passes over the
    // same record, so a save is no reason to bounce back to the list. The
    // "Quay lại" button above the form is the way out.
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Đã cập nhật nhân sự")
    },
  })

  const form = useAppForm({
    defaultValues: buildDefaultValues(myUser),
    validators: {
      onSubmit: myUser.credential
        ? updateUserWithCredentialSchema
        : userFormSchema,
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

      <section className="overflow-hidden rounded-lg bg-card shadow-card">
        <div className="border-b border-border px-4 py-3 sm:px-5">
          <Button
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách nhân sự"
            asChild
          >
            <Link to="/manage/users" search={{ page: 1, limit: 10 }}>
              <ArrowLeft className="size-4" />
              Quay lại
            </Link>
          </Button>
        </div>

        <UserInfoSection form={form} disabled={isPending} />
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <UserJobInfoSection
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
