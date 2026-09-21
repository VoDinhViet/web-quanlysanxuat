import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { Surface } from "@/components/shared/layouts/Surface"
import { supplierReturnQueryOptions } from "@/features/supplier-returns/api/options"
import { SupplierReturnDetailHeader } from "@/features/supplier-returns/components/layouts/SupplierReturnDetailHeader"
import { SupplierReturnItemInfoSection } from "@/features/supplier-returns/components/sections/SupplierReturnItemInfoSection"
import { SupplierReturnSupplierInfoCard } from "@/features/supplier-returns/components/composites/SupplierReturnSupplierInfoCard"
import { SupplierReturnWarehouseSection } from "@/features/supplier-returns/components/sections/SupplierReturnWarehouseSection"

export function SupplierReturnDetailPage() {
  const { supplierReturnId } = useParams({
    from: "/(authed)/manage_/supplier-returns_/$supplierReturnId",
  })

  const { data: supplierReturn } = useSuspenseQuery(
    supplierReturnQueryOptions(supplierReturnId)
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết phiếu trả NCC"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Trả NCC", href: "/manage/supplier-returns" },
          { label: supplierReturn.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface>
          <SupplierReturnDetailHeader supplierReturn={supplierReturn} />
        </Surface>

        <SupplierReturnItemInfoSection supplierReturn={supplierReturn} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SupplierReturnSupplierInfoCard
            supplierId={supplierReturn.supplier.id}
          />
          <SupplierReturnWarehouseSection supplierReturn={supplierReturn} />
        </div>
      </div>
    </main>
  )
}
