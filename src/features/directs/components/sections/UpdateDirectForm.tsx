import { useNavigate } from "@tanstack/react-router"
import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { UpdateDirectExtendedSection } from "@/features/directs/components/sections/UpdateDirectExtendedSection"
import { UpdateDirectInfoSection } from "@/features/directs/components/sections/UpdateDirectInfoSection"
import { updateDirectSchema } from "@/features/directs/schemas/update-direct.schema"
import { updateDirect } from "@/features/directs/api/server-functions/update-direct.api"
import type { UpdateDirectSchema } from "@/features/directs/schemas/update-direct.schema"
import type { Direct } from "@/lib/types/direct.type"

// Direct → raw form values: nullable fields become "", specificWeight stays
// number | undefined for the NumberField (null → undefined).
function getDirectDefaultValues(direct: Direct): UpdateDirectSchema {
  return {
    directId: direct.id,
    code: direct.code,
    name: direct.name,
    unitId: direct.unit.id,
    clientId: direct.client?.id ?? "",
    image: direct.image,
    status: direct.status,
    note: direct.note ?? "",
    supplierId: direct.supplier?.id ?? "",
    minStock: direct.minStock,
    directGrade: direct.directGrade ?? "",
    technicalStandard: direct.technicalStandard ?? "",
    dimensions: direct.dimensions ?? "",
    specificWeight: direct.specificWeight ?? undefined,
    colorSurface: direct.colorSurface ?? "",
    description: direct.description ?? "",
    origin: direct.origin ?? "",
    leadTime: direct.leadTime ?? "",
  }
}

type UpdateDirectFormProps = {
  direct: Direct
}

export function UpdateDirectForm({ direct }: UpdateDirectFormProps) {
  const navigate = useNavigate({
    from: "/manage/directs/$directId/update",
  })
  const queryClient = useQueryClient()
  const updateDirectFn = useServerFn(updateDirect)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateDirectSchema) => updateDirectFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["directs"] })
      await navigate({
        to: "/manage/directs",
        search: { page: 1, limit: 10 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getDirectDefaultValues(direct),
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: updateDirectSchema,
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
        <UpdateDirectInfoSection
          form={form}
          disabled={isPending}
          selectedClient={
            direct.client
              ? { value: direct.client.id, label: direct.client.name }
              : undefined
          }
        />

        <UpdateDirectExtendedSection form={form} disabled={isPending} />

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              void navigate({
                to: "/manage/directs",
                search: { page: 1, limit: 10 },
              })
            }
          >
            Thoát
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
