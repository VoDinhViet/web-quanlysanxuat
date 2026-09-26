import { useParams } from "@tanstack/react-router"
import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { Surface } from "@/components/shared/layouts/Surface"
import { OperationDetailHeader } from "@/features/operations/components/layouts/OperationDetailHeader"
import { OperationInfoSection } from "@/features/operations/components/sections/OperationInfoSection"
import { OperationAssignmentsSection } from "@/features/operations/components/sections/OperationAssignmentsSection"
import { updateOperation } from "@/features/operations/api/server-functions/update-operation.api"
import { operationQueryOptions } from "@/features/operations/api/options"
import { updateOperationSchema } from "@/features/operations/schemas/update-operation.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type { UpdateOperationSchema } from "@/features/operations/schemas/update-operation.schema"
import type { OperationDetail } from "@/lib/types/operation.type"

function getOperationDefaultValues(
  operation: OperationDetail
): UpdateOperationSchema {
  return {
    operationId: operation.id,
    code: operation.code,
    name: operation.name,
    note: operation.note ?? "",
    status: operation.status,
  }
}

export function OperationDetailPage() {
  const { operationId } = useParams({
    from: "/(authed)/manage_/operations_/$operationId",
  })
  const queryClient = useQueryClient()
  const updateOperationFn = useServerFn(updateOperation)

  const { data: operation } = useSuspenseQuery(
    operationQueryOptions(operationId)
  )

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateOperationSchema) =>
      updateOperationFn({ data: value }),
    // Stay on the page: saving is no reason to navigate away.
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["operations"] })
      toast.success("Đã lưu thông tin công đoạn")
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getOperationDefaultValues(operation),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: updateOperationSchema },
    onSubmit: ({ value }) => update(value),
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết công đoạn"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Công đoạn", href: "/manage/settings/operations" },
          { label: operation.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface>
          <OperationDetailHeader
            operation={operation}
            isSaving={isPending}
            onSave={() => {
              if (form.state.isSubmitting) return
              void form.handleSubmit()
            }}
          />
        </Surface>

        <Surface>
          <OperationInfoSection form={form} disabled={isPending} />
        </Surface>

        <OperationAssignmentsSection
          operationId={operation.id}
          operationName={operation.name}
        />
      </div>
    </main>
  )
}
