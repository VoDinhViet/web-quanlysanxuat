import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { EditProductForm } from "@/features/products/components/EditProductForm"
import {
  productGroupOptionsQueryOptions,
  productQueryOptions,
  unitOptionsQueryOptions,
} from "@/features/products/products.query"

export function EditProductPage() {
  const { productId } = useParams({
    from: "/(authed)/manage_/products_/$productId/edit",
  })

  const { data: product } = useSuspenseQuery(productQueryOptions(productId))
  const { data: unitOptions } = useSuspenseQuery(unitOptionsQueryOptions())
  const { data: productGroupOptions } = useSuspenseQuery(
    productGroupOptionsQueryOptions()
  )

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
        />
      </div>
    </main>
  )
}
