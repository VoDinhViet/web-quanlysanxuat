import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { CreateOutsourcingReceiptForm } from "@/features/outsourcing-receipts/components/create/CreateOutsourcingReceiptForm"

export function CreateOutsourcingReceiptPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Nhập hàng gia công về (OS-IN)"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Gia công ngoài", href: "/manage/outsourcing-receipts" },
          {
            label: "Nhập về (OS-IN)",
            href: "/manage/outsourcing-receipts",
          },
          { label: "Nhập hàng về" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <CreateOutsourcingReceiptForm />
      </div>
    </main>
  )
}
