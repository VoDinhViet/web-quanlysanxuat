import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { CreateClientForm } from "@/features/clients/components/create/CreateClientForm"

export function CreateClientPage() {
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
        <CreateClientForm />
      </div>
    </main>
  )
}
