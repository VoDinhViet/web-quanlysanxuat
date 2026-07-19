import { useLoaderData } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { CreateMaterialForm } from "@/features/materials/components/CreateMaterialForm"

export function CreateMaterialPage() {
  const { unitOptions, materialGroupOptions, clientOptions, supplierOptions } =
    useLoaderData({ from: "/(authed)/manage_/materials_/create" })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo vật tư"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Sản xuất" },
          { label: "Vật tư", href: "/manage/materials" },
          { label: "Tạo vật tư" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <CreateMaterialForm
          unitOptions={unitOptions}
          materialGroupOptions={materialGroupOptions}
          clientOptions={clientOptions}
          supplierOptions={supplierOptions}
        />
      </div>
    </main>
  )
}
