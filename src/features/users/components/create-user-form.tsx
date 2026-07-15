import { Activity } from "react"
import { useForm } from "@tanstack/react-form"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { AlertOctagon, Loader2, Save } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CreateUserAccountSection } from "@/features/users/components/create-user-account-section"
import { CreateUserJobInfoSection } from "@/features/users/components/create-user-job-info-section"
import { CreateUserPersonalInfoSection } from "@/features/users/components/create-user-personal-info-section"
import { createUserSchema } from "@/features/users/schemas/create-user.schema"
import { createUser } from "@/features/users/server-functions/create-user"
import type { CreateUserSchema } from "@/features/users/schemas/create-user.schema"
import type {
  Department,
  Position,
} from "@/features/users/types/organization.type"

const DEFAULT_VALUES: CreateUserSchema = {
  fullName: "",
  gender: "MALE",
  dateOfBirth: "",
  idNumber: "",
  phoneNumber: "",
  email: "",
  address: "",
  avatarUrl: "",
  departmentId: "",
  positionId: "",
  hireDate: "",
  note: "",
  employmentStatus: "WORKING",
  accountEnabled: false,
  accountUsername: "",
  accountEmail: "",
  accountPassword: "",
  accountConfirmPassword: "",
  accountActive: true,
}

function useCreateUserForm(onSubmit: (value: CreateUserSchema) => void) {
  return useForm({
    defaultValues: DEFAULT_VALUES,
    validators: {
      onSubmit: createUserSchema,
    },
    onSubmit: ({ value }) => onSubmit(value),
  })
}

export type CreateUserFormApi = ReturnType<typeof useCreateUserForm>

type CreateUserFormProps = {
  departments: Department[]
  positions: Position[]
}

export function CreateUserForm({
  departments,
  positions,
}: CreateUserFormProps) {
  const navigate = useNavigate({ from: "/manage/users/add" })
  const router = useRouter()
  const createUserFn = useServerFn(createUser)

  const createUserMutation = useMutation({
    mutationFn: (value: CreateUserSchema) => createUserFn({ data: value }),
    onSuccess: async () => {
      await router.invalidate()
      await navigate({ to: "/manage/users", search: { page: 1, limit: 10 } })
    },
  })

  const isPending = createUserMutation.isPending
  const error = createUserMutation.error?.message ?? null

  const form = useCreateUserForm((value) => createUserMutation.mutate(value))

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="space-y-5"
    >
      <Activity mode={error ? "visible" : "hidden"}>
        <Alert className="border-destructive/20 bg-destructive/10 text-destructive">
          <AlertOctagon className="size-4" />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      </Activity>

      <CreateUserPersonalInfoSection form={form} disabled={isPending} />
      <CreateUserJobInfoSection
        form={form}
        disabled={isPending}
        departments={departments}
        positions={positions}
      />
      <CreateUserAccountSection form={form} disabled={isPending} />

      <div className="flex flex-wrap items-center justify-end gap-3 rounded-lg bg-card px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
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
        <Button type="button" variant="outline">
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
    </form>
  )
}
