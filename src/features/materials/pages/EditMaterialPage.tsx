import { useLoaderData } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { EditMaterialForm } from "@/features/materials/components/EditMaterialForm"

export function EditMaterialPage() {
  const {
    material,
    unitOptions,
    materialGroupOptions,
    clientOptions,
    supplierOptions,
  } = useLoaderData({
    from: "/(authed)/manage_/materials_/$materialId/edit",
  })

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
        <EditMaterialForm
          material={material}
          unitOptions={unitOptions}
          materialGroupOptions={materialGroupOptions}
          clientOptions={clientOptions}
          supplierOptions={supplierOptions}
        />
      </div>
    </main>
  )
}
