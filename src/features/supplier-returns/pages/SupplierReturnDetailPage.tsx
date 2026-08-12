import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { supplierReturnQueryOptions } from "@/features/supplier-returns/api/options"
import { SupplierReturnDetailActions } from "@/features/supplier-returns/components/detail/SupplierReturnDetailActions"
import { SupplierReturnDetailHeader } from "@/features/supplier-returns/components/detail/SupplierReturnDetailHeader"
import { SupplierReturnItemInfoSection } from "@/features/supplier-returns/components/detail/SupplierReturnItemInfoSection"
import { SupplierReturnReasonSection } from "@/features/supplier-returns/components/detail/SupplierReturnReasonSection"
import { SupplierReturnReferenceCard } from "@/features/supplier-returns/components/detail/SupplierReturnReferenceCard"
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
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Trả NCC", href: "/manage/supplier-returns" },
          { label: detail.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface>
          <SupplierReturnDetailHeader detail={detail} />
        </Surface>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SupplierReturnReferenceCard detail={detail} />
          <SupplierReturnSupplierInfoCard supplierId={detail.supplier.id} />
        </div>

        <SupplierReturnReasonSection />
        <SupplierReturnItemInfoSection detail={detail} />
        <SupplierReturnWarehouseSection detail={detail} />

        <SupplierReturnDetailActions />
      </div>
    </main>
  )
}
