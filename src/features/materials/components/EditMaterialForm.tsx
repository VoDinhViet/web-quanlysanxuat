import { Activity } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertOctagon, Loader2, Save } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { CreateMaterialExtendedSection } from "@/features/materials/components/CreateMaterialExtendedSection"
import { CreateMaterialInfoSection } from "@/features/materials/components/CreateMaterialInfoSection"
import { createMaterialSchema } from "@/features/materials/schemas/create-material.schema"
import { updateMaterial } from "@/features/materials/server-functions/update-material"
import type { CreateMaterialSchema } from "@/features/materials/schemas/create-material.schema"
import type {
  Material,
  MaterialRef,
} from "@/features/materials/types/material.type"

// Material → raw form values: nullable fields become "", specificWeight
// (string | null on the wire) falls straight through to the text input.
function buildMaterialDefaultValues(material: Material): CreateMaterialSchema {
  return {
    name: material.name,
    unitId: material.unit.id,
    materialGroupId: material.group.id,
    type: material.type,
    clientId: material.client?.id ?? "",
    imageUrl: material.imageUrl ?? "",
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
      url: attachment.url,
      filename: attachment.filename,
      mimetype: attachment.mimetype,
      size: attachment.size,
    })),
  }
}

type EditMaterialFormProps = {
  material: Material
  unitOptions: MaterialRef[]
  materialGroupOptions: MaterialRef[]
  supplierOptions: MaterialRef[]
}

export function EditMaterialForm({
  material,
  unitOptions,
  materialGroupOptions,
  supplierOptions,
}: EditMaterialFormProps) {
  const navigate = useNavigate({ from: "/manage/materials/$materialId/edit" })
  const queryClient = useQueryClient()
  const updateMaterialFn = useServerFn(updateMaterial)

  const {
    mutate: update,
    isPending,
    error,
  } = useMutation({
    mutationFn: (value: CreateMaterialSchema) =>
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
      onSubmit: createMaterialSchema,
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

      <div className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <CreateMaterialInfoSection
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
          <CreateMaterialExtendedSection
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
