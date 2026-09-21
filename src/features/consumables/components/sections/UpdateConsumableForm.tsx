import { useNavigate } from "@tanstack/react-router"
import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { UpdateConsumableExtendedSection } from "@/features/consumables/components/sections/UpdateConsumableExtendedSection"
import { UpdateConsumableInfoSection } from "@/features/consumables/components/sections/UpdateConsumableInfoSection"
import { updateConsumableSchema } from "@/features/consumables/schemas/update-consumable.schema"
import { updateConsumable } from "@/features/consumables/api/server-functions/update-consumable.api"
import type { UpdateConsumableSchema } from "@/features/consumables/schemas/update-consumable.schema"
import type { Consumable } from "@/lib/types/consumable.type"

// Consumable → raw form values: nullable fields become "", specificWeight stays
// number | undefined for the NumberField (null → undefined).
function getConsumableDefaultValues(
  consumable: Consumable
): UpdateConsumableSchema {
  return {
    consumableId: consumable.id,
    name: consumable.name,
    unitId: consumable.unit.id,
    clientId: consumable.client?.id ?? "",
    image: consumable.image,
    status: consumable.status,
    note: consumable.note ?? "",
    supplierId: consumable.supplier?.id ?? "",
    minStock: consumable.minStock,
    consumableGrade: consumable.consumableGrade ?? "",
    technicalStandard: consumable.technicalStandard ?? "",
    dimensions: consumable.dimensions ?? "",
    specificWeight: consumable.specificWeight ?? undefined,
    colorSurface: consumable.colorSurface ?? "",
    description: consumable.description ?? "",
    origin: consumable.origin ?? "",
    leadTime: consumable.leadTime ?? "",
  }
}

type UpdateConsumableFormProps = {
  consumable: Consumable
}

export function UpdateConsumableForm({
  consumable,
}: UpdateConsumableFormProps) {
  const navigate = useNavigate({
    from: "/manage/consumables/$consumableId/update",
  })
  const queryClient = useQueryClient()
  const updateConsumableFn = useServerFn(updateConsumable)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateConsumableSchema) =>
      updateConsumableFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["consumables"] })
      await navigate({
        to: "/manage/consumables",
        search: { page: 1, limit: 10 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getConsumableDefaultValues(consumable),
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: updateConsumableSchema,
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
        <UpdateConsumableInfoSection
          form={form}
          disabled={isPending}
          selectedClient={
            consumable.client
              ? { value: consumable.client.id, label: consumable.client.name }
              : undefined
          }
        />

        <UpdateConsumableExtendedSection form={form} disabled={isPending} />

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              void navigate({
                to: "/manage/consumables",
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
      </div>
    </form>
  )
}
