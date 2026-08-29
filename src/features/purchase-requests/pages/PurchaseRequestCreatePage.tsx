import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { PurchaseRequestCreateForm } from "@/features/purchase-requests/components/create/PurchaseRequestCreateForm"

export function PurchaseRequestCreatePage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo đề xuất mua hàng"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Đề xuất mua hàng", href: "/manage/purchase-requests" },
          { label: "Tạo đề xuất mua hàng" },
        ]}
      />

      <div className="requisition-sheet flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <PurchaseRequestCreateForm />
      </div>
    </main>
  )
}
