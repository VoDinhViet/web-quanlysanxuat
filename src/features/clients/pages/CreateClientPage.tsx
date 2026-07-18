import { useLoaderData } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { CreateClientForm } from "@/features/clients/components/CreateClientForm"

export function CreateClientPage() {
  const { clientGroupOptions } = useLoaderData({
    from: "/(authed)/manage_/clients_/create",
  })

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
