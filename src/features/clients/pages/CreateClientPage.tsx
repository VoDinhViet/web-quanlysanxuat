import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { CreateClientForm } from "@/features/clients/components/CreateClientForm"
import { clientGroupOptionsQueryOptions } from "@/features/clients/clients.query"

export function CreateClientPage() {
  const { data: clientGroupOptions } = useSuspenseQuery(
    clientGroupOptionsQueryOptions()
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo khách hàng"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Khách hàng", href: "/manage/clients" },
          { label: "Tạo khách hàng" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <CreateClientForm clientGroupOptions={clientGroupOptions} />
      </div>
    </main>
  )
}
