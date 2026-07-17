import { PageTitleBar } from "@/components/shared/PageTitleBar"

export function ManagePage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Quản lý nhà cung cấp"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Mua hàng" },
          { label: "Nhà cung cấp" },
        ]}
        notificationCount={5}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 p-6">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          Quản trị
        </p>
        <h2 className="text-2xl font-semibold">Manage</h2>
      </div>
    </main>
  )
}
