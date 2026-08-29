import { Link, useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Edit3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { useAppForm } from "@/hooks/use-app-form"
import { UpdateSupplierInfoSection } from "@/features/suppliers/components/update/UpdateSupplierInfoSection"
import { UpdateSupplierOtherSection } from "@/features/suppliers/components/update/UpdateSupplierOtherSection"
import { UpdateSupplierPaymentSection } from "@/features/suppliers/components/update/UpdateSupplierPaymentSection"
import { getSupplierDefaultValues } from "@/features/suppliers/components/update/UpdateSupplierForm"
import { supplierQueryOptions } from "@/features/suppliers/api/options"

export function SupplierDetailPage() {
  const { supplierId } = useParams({
    from: "/(authed)/manage_/suppliers_/$supplierId",
  })

  const { data: supplier } = useSuspenseQuery(supplierQueryOptions(supplierId))

  // Read-only view reuses the update flow's own sections (disabled) instead of a
  // separate view-mode markup — same field layout/labels always stay in sync, form is
  // never submitted here.
  const form = useAppForm({ defaultValues: getSupplierDefaultValues(supplier) })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi Tiết Nhà Cung Cấp"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Mua hàng" },
          { label: "Nhà cung cấp", href: "/manage/suppliers" },
          { label: supplier.code },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <div className="overflow-hidden rounded-lg bg-card shadow-card">
          <UpdateSupplierInfoSection form={form} disabled />

          <div className="grid grid-cols-1 lg:grid-cols-2">
            <UpdateSupplierPaymentSection form={form} disabled />
            <UpdateSupplierOtherSection form={form} disabled />
          </div>

          <RoutePermissionGate route="/manage/suppliers/$supplierId/update">
            <div className="flex justify-end border-t border-border px-4 py-4 sm:px-5">
              <Button asChild>
                <Link
                  to="/manage/suppliers/$supplierId/update"
                  params={{ supplierId: supplier.id }}
                >
                  <Edit3 />
                  Chỉnh sửa
                </Link>
              </Button>
            </div>
          </RoutePermissionGate>
        </div>
      </div>
    </main>
  )
}
