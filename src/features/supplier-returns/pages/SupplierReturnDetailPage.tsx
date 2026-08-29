import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { supplierReturnQueryOptions } from "@/features/supplier-returns/api/options"
import { SupplierReturnDetailHeader } from "@/features/supplier-returns/components/detail/SupplierReturnDetailHeader"
import { SupplierReturnItemInfoSection } from "@/features/supplier-returns/components/detail/SupplierReturnItemInfoSection"
import { SupplierReturnSupplierInfoCard } from "@/features/supplier-returns/components/detail/SupplierReturnSupplierInfoCard"
import { SupplierReturnWarehouseSection } from "@/features/supplier-returns/components/detail/SupplierReturnWarehouseSection"

export function SupplierReturnDetailPage() {
  const { supplierReturnId } = useParams({
    from: "/(authed)/manage_/supplier-returns_/$supplierReturnId",
  })

  const { data: detail } = useSuspenseQuery(
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
          { label: detail.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface>
          <SupplierReturnDetailHeader detail={detail} />
        </Surface>

        <SupplierReturnItemInfoSection detail={detail} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SupplierReturnSupplierInfoCard supplierId={detail.supplier.id} />
          <SupplierReturnWarehouseSection detail={detail} />
        </div>
      </div>
    </main>
  )
}
