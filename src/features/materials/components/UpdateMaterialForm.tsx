import { Activity } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertOctagon, Loader2, Save } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { MaterialExtendedSection } from "@/features/materials/components/MaterialExtendedSection"
import { MaterialInfoSection } from "@/features/materials/components/MaterialInfoSection"
import { materialFormSchema } from "@/features/materials/schemas/material-form.schema"
import { updateMaterial } from "@/features/materials/server-functions/update-material"
import type { MaterialFormSchema } from "@/features/materials/schemas/material-form.schema"
import type {
  Material,
  MaterialRef,
} from "@/features/materials/types/material.type"

// Material → raw form values: nullable fields become "", specificWeight
// (string | null on the wire) falls straight through to the text input.
function buildMaterialDefaultValues(material: Material): MaterialFormSchema {
  return {
    name: material.name,
    unitId: material.unit.id,
    materialGroupId: material.group.id,
    type: material.type,
    clientId: material.client?.id ?? "",
    image: material.image,
    status: material.status,
    note: material.note ?? "",
    materialGrade: material.materialGrade ?? "",
    technicalStandard: material.technicalStandard ?? "",
    dimensions: material.dimensions ?? "",
    specificWeight: material.specificWeight ?? "",
    colorSurface: material.colorSurface ?? "",
    description: material.description ?? "",
    origin: material.origin ?? "",
    preferredSupplierId: material.preferredSupplier?.id ?? "",
    leadTime: material.leadTime ?? "",
    attachments: (material.attachments ?? []).map((attachment) => ({
      id: attachment.file.id,
      url: attachment.file.url,
      originalName: attachment.file.originalName,
    })),
  }
}

type UpdateMaterialFormProps = {
  material: Material
  unitOptions: MaterialRef[]
  materialGroupOptions: MaterialRef[]
  supplierOptions: MaterialRef[]
}

export function UpdateMaterialForm({
  material,
  unitOptions,
  materialGroupOptions,
  supplierOptions,
}: UpdateMaterialFormProps) {
  const navigate = useNavigate({ from: "/manage/materials/$materialId/update" })
  const queryClient = useQueryClient()
  const updateMaterialFn = useServerFn(updateMaterial)

  const {
    mutate: update,
    isPending,
    error,
  } = useMutation({
    mutationFn: (value: MaterialFormSchema) =>
      updateMaterialFn({ data: { ...value, materialId: material.id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["materials"] })
      await navigate({
        to: "/manage/materials",
        search: { page: 1, limit: 10 },
      })
    },
  })

  const form = useAppForm({
    defaultValues: buildMaterialDefaultValues(material),
    validators: {
      onSubmit: materialFormSchema,
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

      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <MaterialInfoSection
          form={form}
          disabled={isPending}
          unitOptions={unitOptions}
          materialGroupOptions={materialGroupOptions}
          selectedClient={
            material.client
              ? { value: material.client.id, label: material.client.name }
              : undefined
          }
        />

        <div className="border-t border-border">
          <MaterialExtendedSection
            form={form}
            disabled={isPending}
            supplierOptions={supplierOptions}
          />
        </div>

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
