import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { EditSupplierForm } from "@/features/suppliers/components/EditSupplierForm"
import {
  countryOptionsQueryOptions,
  supplierGroupOptionsQueryOptions,
  supplierQueryOptions,
} from "@/features/suppliers/suppliers.query"

export function EditSupplierPage() {
  const { supplierId } = useParams({
    from: "/(authed)/manage_/suppliers_/$supplierId/edit",
  })

  const { data: supplier } = useSuspenseQuery(supplierQueryOptions(supplierId))
  const { data: supplierGroupOptions } = useSuspenseQuery(
    supplierGroupOptionsQueryOptions()
  )
  const { data: countryOptions } = useSuspenseQuery(
    countryOptionsQueryOptions()
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chỉnh Sửa Nhà Cung Cấp"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Mua hàng" },
          { label: "Nhà cung cấp", href: "/manage/suppliers" },
          { label: "Chỉnh Sửa Nhà Cung Cấp" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <EditSupplierForm
          supplier={supplier}
          supplierGroupOptions={supplierGroupOptions}
          countryOptions={countryOptions}
        />
      </div>
    </main>
  )
}
