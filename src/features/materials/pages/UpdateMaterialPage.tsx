import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { UpdateMaterialForm } from "@/features/materials/components/UpdateMaterialForm"
import {
  materialGroupOptionsQueryOptions,
  materialQueryOptions,
  supplierOptionsQueryOptions,
  unitOptionsQueryOptions,
} from "@/features/materials/materials.query"

export function UpdateMaterialPage() {
  const { materialId } = useParams({
    from: "/(authed)/manage_/materials_/$materialId/update",
  })

  const { data: material } = useSuspenseQuery(materialQueryOptions(materialId))
  const { data: unitOptions } = useSuspenseQuery(unitOptionsQueryOptions())
  const { data: materialGroupOptions } = useSuspenseQuery(
    materialGroupOptionsQueryOptions()
  )
  const { data: supplierOptions } = useSuspenseQuery(
    supplierOptionsQueryOptions()
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chỉnh sửa vật tư"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Sản xuất" },
          { label: "Vật tư", href: "/manage/materials" },
          { label: "Chỉnh sửa vật tư" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <UpdateMaterialForm
          material={material}
          unitOptions={unitOptions}
          materialGroupOptions={materialGroupOptions}
          supplierOptions={supplierOptions}
        />
      </div>
    </main>
  )
}
