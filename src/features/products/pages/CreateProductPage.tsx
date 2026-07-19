import { useLoaderData } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { CreateProductForm } from "@/features/products/components/CreateProductForm"

export function CreateProductPage() {
  const { unitOptions, productGroupOptions, clientOptions } = useLoaderData({
    from: "/(authed)/manage_/products_/create",
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo sản phẩm"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Sản phẩm", href: "/manage/products" },
          { label: "Tạo sản phẩm" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <CreateProductForm
          unitOptions={unitOptions}
          productGroupOptions={productGroupOptions}
          clientOptions={clientOptions}
        />
      </div>
    </main>
  )
}
