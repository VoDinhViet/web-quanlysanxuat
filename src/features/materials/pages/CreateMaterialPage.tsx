import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { CreateMaterialForm } from "@/features/materials/components/CreateMaterialForm"
import {
  materialGroupOptionsQueryOptions,
  supplierOptionsQueryOptions,
  unitOptionsQueryOptions,
} from "@/features/materials/materials.query"

export function CreateMaterialPage() {
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
          supplierOptions={supplierOptions}
        />
      </div>
    </main>
  )
}
