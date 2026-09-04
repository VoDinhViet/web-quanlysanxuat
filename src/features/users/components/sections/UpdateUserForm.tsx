import { useEffect } from "react"
import { DateTime } from "luxon"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button, LinkButton } from "@/components/ui/button"
import { UpdateUserJobInfoSection } from "@/features/users/components/sections/UpdateUserJobInfoSection"
import { UpdateUserInfoSection } from "@/features/users/components/sections/UpdateUserInfoSection"
import { UpdateUserCredentialSection } from "@/features/users/components/sections/UpdateUserCredentialSection"
import { userQueryOptions } from "@/features/users/api/options"
import { updateUser } from "@/features/users/api/server-functions/update-user.api"
import { updateUserSchema } from "@/features/users/schemas/update-user.schema"
import type { UpdateUserSchema } from "@/features/users/schemas/update-user.schema"
import type { User } from "@/lib/types/user.type"

// User → raw form values: nullable fields become "", ISO datetimes become the yyyy-MM-dd
// strings the date pickers work with. `credential` carries the existing ERP account's id
// — updateCredentialSchema reads it to allow a blank password (blank = keep the current
// password); an employee with no account yet gets undefined.
function getUserDefaultValues(user: User): UpdateUserSchema {
  return {
    userId: user.id,
    fullName: user.fullName,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth
      ? DateTime.fromISO(user.dateOfBirth).toFormat("yyyy-MM-dd")
      : "",
    idNumber: user.idNumber ?? "",
    phoneNumber: user.phoneNumber ?? "",
    address: user.address ?? "",
    avatar: user.avatar,
    departmentId: user.department.id,
    positionId: user.position.id,
    hireDate: DateTime.fromISO(user.hireDate).toFormat("yyyy-MM-dd"),
    note: user.note ?? "",
    status: user.status,
    credential: user.credential
      ? {
          credentialId: user.credential.id,
          username: user.credential.username,
          email: user.credential.email,
          password: "",
          roleId: user.credential.role?.id ?? "",
          credentialEnabled: user.credential.credentialEnabled,
        }
      : undefined,
  }
}

// Trial #2 of react-hook-form (see CreateUserForm.tsx and LoginForm.tsx) — same idiom, `{ raw:
// true }` keeps handleSubmit's value un-transformed (z.input), matching what updateUser's own
// `.validator()` re-parses. Only ever rendered on the update route, so reading `userId` off the
// route params here (rather than the caller passing `user` down as a prop) is safe — unlike
// CreateUserForm, this component isn't reused on a route without that param.
export function UpdateUserForm() {
  const { userId } = useParams({
    from: "/(authed)/manage_/users_/$userId/update",
  })
  // The route loader already prefetches this — resolves synchronously off cache.
  const { data: user } = useSuspenseQuery(userQueryOptions(userId))
  const navigate = useNavigate({ from: "/manage/users/$userId/update" })
  const queryClient = useQueryClient()
  const updateUserFn = useServerFn(updateUser)
  const hasExistingCredential = user.credential != null

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

  const form = useForm<UpdateUserSchema>({
    resolver: zodResolver(updateUserSchema, undefined, { raw: true }),
    defaultValues: getUserDefaultValues(user),
  })

  // react-hook-form "materializes" an unset nested object as soon as a child controller mounts
  // (see the same comment in CreateUserForm.tsx) — but only employees without an existing
  // account are exposed to it: theirs starts `undefined` and gets back-filled by the 5
  // credential.* controllers on mount, while an employee who already has an account has
  // `credential` fully populated in `defaultValues`, so nothing here should touch it.
  useEffect(() => {
    if (!hasExistingCredential) form.setValue("credential", undefined)
  }, [form, hasExistingCredential])

  return (
    <form
      onSubmit={form.handleSubmit((values) => update(values))}
      noValidate
      className="space-y-6"
    >
      <section className="overflow-hidden rounded-lg bg-card shadow-card">
        <div className="border-b border-border px-4 py-3 sm:px-5">
          <LinkButton
            to="/manage/users"
            search={{ page: 1, limit: 10 }}
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách nhân sự"
          >
            <ArrowLeft className="size-4" />
            Quay lại
          </LinkButton>
        </div>

        <UpdateUserInfoSection form={form} disabled={isPending} />
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <UpdateUserJobInfoSection form={form} disabled={isPending} />
          <UpdateUserCredentialSection
            form={form}
            disabled={isPending}
            hasExistingCredential={hasExistingCredential}
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="outline"
            isDisabled={isPending}
            onPress={() =>
              void navigate({
                to: "/manage/users",
                search: { page: 1, limit: 10 },
              })
            }
          >
            Hủy
          </Button>
          <Button
            type="submit"
            isDisabled={form.formState.isSubmitting || isPending}
          >
            {form.formState.isSubmitting || isPending ? (
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
        </div>
      </section>
    </form>
  )
}
