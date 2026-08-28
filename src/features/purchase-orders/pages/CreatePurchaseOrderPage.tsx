import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { CreatePurchaseOrderForm } from "@/features/purchase-orders/components/create/CreatePurchaseOrderForm"

export function CreatePurchaseOrderPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo PO thủ công"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Đơn mua hàng", href: "/manage/purchase-orders" },
          { label: "Tạo PO thủ công" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <CreatePurchaseOrderForm />
      </div>
    </main>
  )
}
