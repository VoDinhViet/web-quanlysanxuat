import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { CreateQuotationForm } from "@/features/purchase-quotations/components/create/CreateQuotationForm"

export function CreateQuotationPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo RFQ"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Báo giá NCC", href: "/manage/purchase-quotations" },
          { label: "Tạo RFQ" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <CreateQuotationForm />
      </div>
    </main>
  )
}
