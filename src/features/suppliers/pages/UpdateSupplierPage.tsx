import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { UpdateSupplierForm } from "@/features/suppliers/components/sections/UpdateSupplierForm"
import { supplierQueryOptions } from "@/features/suppliers/api/options"

export function UpdateSupplierPage() {
  const { supplierId } = useParams({
    from: "/(authed)/manage_/suppliers_/$supplierId/update",
  })

  const { data: supplier } = useSuspenseQuery(supplierQueryOptions(supplierId))

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chỉnh Sửa Nhà Cung Cấp"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Mua hàng" },
          { label: "Nhà cung cấp", href: "/manage/suppliers" },
          { label: "Chỉnh Sửa Nhà Cung Cấp" },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <UpdateSupplierForm supplier={supplier} />
      </div>
    </main>
  )
}
