import { useLoaderData } from "@tanstack/react-router"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { EditProductForm } from "@/features/products/components/EditProductForm"

export function EditProductPage() {
  const { product, unitOptions, productGroupOptions, clientOptions } =
    useLoaderData({
      from: "/(authed)/manage_/products_/$productId/edit",
    })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chỉnh sửa sản phẩm"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Sản phẩm", href: "/manage/products" },
          { label: "Chỉnh sửa sản phẩm" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <EditProductForm
          product={product}
          unitOptions={unitOptions}
          productGroupOptions={productGroupOptions}
          clientOptions={clientOptions}
        />
      </div>
    </main>
  )
}
