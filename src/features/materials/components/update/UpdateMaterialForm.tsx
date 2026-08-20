import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { UpdateMaterialExtendedSection } from "@/features/materials/components/update/UpdateMaterialExtendedSection"
import { UpdateMaterialInfoSection } from "@/features/materials/components/update/UpdateMaterialInfoSection"
import { updateMaterialSchema } from "@/features/materials/schemas/update-material.schema"
import { updateMaterial } from "@/features/materials/api/server-functions/update-material.api"
import type { UpdateMaterialSchema } from "@/features/materials/schemas/update-material.schema"
import type { Material } from "@/lib/types/material.type"

// Material → raw form values: nullable fields become "", specificWeight stays
// number | undefined for the NumberField (null → undefined).
function getMaterialDefaultValues(material: Material): UpdateMaterialSchema {
  return {
    materialId: material.id,
    name: material.name,
    unitId: material.unit.id,
    clientId: material.client?.id ?? "",
    image: material.image,
    status: material.status,
    note: material.note ?? "",
    supplierId: material.supplier?.id ?? "",
    minStock: material.minStock,
    materialGrade: material.materialGrade ?? "",
    technicalStandard: material.technicalStandard ?? "",
    dimensions: material.dimensions ?? "",
    specificWeight: material.specificWeight ?? undefined,
    colorSurface: material.colorSurface ?? "",
    description: material.description ?? "",
    origin: material.origin ?? "",
    leadTime: material.leadTime ?? "",
  }
}

type UpdateMaterialFormProps = {
  material: Material
}

export function UpdateMaterialForm({ material }: UpdateMaterialFormProps) {
  const navigate = useNavigate({ from: "/manage/materials/$materialId/update" })
  const queryClient = useQueryClient()
  const updateMaterialFn = useServerFn(updateMaterial)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateMaterialSchema) =>
      updateMaterialFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["materials"] })
      await navigate({
        to: "/manage/materials",
        search: { page: 1, limit: 10 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getMaterialDefaultValues(material),
    validators: {
      onSubmit: updateMaterialSchema,
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
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <UpdateMaterialInfoSection
          form={form}
          disabled={isPending}
          selectedClient={
            material.client
              ? { value: material.client.id, label: material.client.name }
              : undefined
          }
        />

        <UpdateMaterialExtendedSection form={form} disabled={isPending} />

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              void navigate({
                to: "/manage/materials",
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
