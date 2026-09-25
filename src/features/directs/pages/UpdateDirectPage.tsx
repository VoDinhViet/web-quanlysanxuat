import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { UpdateDirectForm } from "@/features/directs/components/sections/UpdateDirectForm"
import { directQueryOptions } from "@/features/directs/api/options"

export function UpdateDirectPage() {
  const { directId } = useParams({
    from: "/(authed)/manage_/directs_/$directId/update",
  })

  const { data: direct } = useSuspenseQuery(directQueryOptions(directId))

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chỉnh sửa vật tư"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Sản xuất" },
          { label: "Vật tư", href: "/manage/directs" },
          { label: "Chỉnh sửa vật tư" },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <UpdateDirectForm direct={direct} />
      </div>
    </main>
  )
}
