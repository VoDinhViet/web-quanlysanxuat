import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { UpdateClientForm } from "@/features/clients/components/update/UpdateClientForm"
import { clientQueryOptions } from "@/features/clients/api/options"

export function UpdateClientPage() {
  const { clientId } = useParams({
    from: "/(authed)/manage_/clients_/$clientId/update",
  })

  const { data: client } = useSuspenseQuery(clientQueryOptions(clientId))

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chỉnh sửa khách hàng"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Khách hàng", href: "/manage/clients" },
          { label: "Chỉnh sửa khách hàng" },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <UpdateClientForm client={client} />
      </div>
    </main>
  )
}
