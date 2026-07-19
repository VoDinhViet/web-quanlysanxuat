import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { CreateProductForm } from "@/features/products/components/CreateProductForm"
import {
  productGroupOptionsQueryOptions,
  unitOptionsQueryOptions,
} from "@/features/products/products.query"

export function CreateProductPage() {
  const { data: unitOptions } = useSuspenseQuery(unitOptionsQueryOptions())
  const { data: productGroupOptions } = useSuspenseQuery(
    productGroupOptionsQueryOptions()
  )

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
        />
      </div>
    </main>
  )
}
