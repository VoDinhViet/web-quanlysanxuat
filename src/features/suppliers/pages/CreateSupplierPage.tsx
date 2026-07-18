import { useLoaderData } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { CreateSupplierForm } from "@/features/suppliers/components/CreateSupplierForm"

export function CreateSupplierPage() {
  const { supplierGroupOptions, countryOptions } = useLoaderData({
    from: "/(authed)/manage_/suppliers_/create",
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Thêm nhà cung cấp"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Mua hàng" },
          { label: "Nhà cung cấp", href: "/manage/suppliers" },
          { label: "Thêm nhà cung cấp" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <CreateSupplierForm
          supplierGroupOptions={supplierGroupOptions}
          countryOptions={countryOptions}
        />
      </div>
    </main>
  )
}
