import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { UpdateConsumableForm } from "@/features/consumables/components/sections/UpdateConsumableForm"
import { consumableQueryOptions } from "@/features/consumables/api/options"

export function UpdateConsumablePage() {
  const { consumableId } = useParams({
    from: "/(authed)/manage_/consumables_/$consumableId/update",
  })

  const { data: consumable } = useSuspenseQuery(consumableQueryOptions(consumableId))

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chỉnh sửa vật tư"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Sản xuất" },
          { label: "Vật tư", href: "/manage/consumables" },
          { label: "Chỉnh sửa vật tư" },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <UpdateConsumableForm consumable={consumable} />
      </div>
    </main>
  )
}
