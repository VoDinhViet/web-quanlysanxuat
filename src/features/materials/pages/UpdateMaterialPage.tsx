import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { UpdateMaterialForm } from "@/features/materials/components/update/UpdateMaterialForm"
import { materialQueryOptions } from "@/features/materials/api/options"

export function UpdateMaterialPage() {
  const { materialId } = useParams({
    from: "/(authed)/manage_/materials_/$materialId/update",
  })

  const { data: material } = useSuspenseQuery(materialQueryOptions(materialId))

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chỉnh sửa vật tư"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Sản xuất" },
          { label: "Vật tư", href: "/manage/materials" },
          { label: "Chỉnh sửa vật tư" },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <UpdateMaterialForm material={material} />
      </div>
    </main>
  )
}
