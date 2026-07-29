import { DateTime } from "luxon"
import { Link, useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { UpdateUserJobInfoSection } from "@/features/users/components/UpdateUserJobInfoSection"
import { UpdateUserInfoSection } from "@/features/users/components/UpdateUserInfoSection"
import { UpdateUserCredentialSection } from "@/features/users/components/UpdateUserCredentialSection"
import { updateUser } from "@/features/users/api/server-functions/update-user.api"
import { updateUserSchema } from "@/features/users/schemas/update-user.schema"
import type { UpdateUserSchema } from "@/features/users/schemas/update-user.schema"
import type { User } from "@/lib/types/user.type"

type UpdateUserFormProps = {
  myUser: User
}

export function UpdateUserForm({ myUser }: UpdateUserFormProps) {
  const navigate = useNavigate({ from: "/manage/users/$userId/update" })
  const queryClient = useQueryClient()
  const updateUserFn = useServerFn(updateUser)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateUserSchema) => updateUserFn({ data: value }),
    // Stay on the page: editing an employee is often several passes over the
    // same record, so a save is no reason to bounce back to the list. The
    // "Quay lại" button above the form is the way out.
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Đã cập nhật nhân sự")
    },
    onError: (error) => toast.error(error.message),
  })

  // User → raw form values: nullable fields become "", ISO datetimes become the yyyy-MM-dd
  // strings the date pickers work with. `credential` carries the existing ERP account's id
  // — updateCredentialSchema reads it to allow a blank password (blank = keep the current
  // password); an employee with no account yet gets undefined.
  const defaultValues: UpdateUserSchema = {
    userId: myUser.id,
    fullName: myUser.fullName,
    gender: myUser.gender,
    dateOfBirth: myUser.dateOfBirth
      ? DateTime.fromISO(myUser.dateOfBirth).toFormat("yyyy-MM-dd")
      : "",
    idNumber: myUser.idNumber ?? "",
    phoneNumber: myUser.phoneNumber ?? "",
    email: myUser.email ?? "",
    address: myUser.address ?? "",
    avatar: myUser.avatar,
    departmentId: myUser.department.id,
    positionId: myUser.position.id,
    hireDate: DateTime.fromISO(myUser.hireDate).toFormat("yyyy-MM-dd"),
    note: myUser.note ?? "",
    status: myUser.status,
    credential: myUser.credential
      ? {
          credentialId: myUser.credential.id,
          username: myUser.credential.username,
          email: myUser.credential.email,
          password: "",
          roleId: myUser.credential.role?.id ?? "",
        }
      : undefined,
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: updateUserSchema,
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

        <UpdateUserInfoSection form={form} disabled={isPending} />
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <UpdateUserJobInfoSection form={form} disabled={isPending} />
          <UpdateUserCredentialSection
            form={form}
            disabled={isPending}
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
