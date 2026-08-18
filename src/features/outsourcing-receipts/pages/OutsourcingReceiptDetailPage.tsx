import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import {
  outsourcingReceiptItemsQueryOptions,
  outsourcingReceiptQueryOptions,
} from "@/features/outsourcing-receipts/api/options"
import { OutsourcingReceiptDetailHeader } from "@/features/outsourcing-receipts/components/detail/OutsourcingReceiptDetailHeader"
import { OutsourcingReceiptInfoCard } from "@/features/outsourcing-receipts/components/detail/OutsourcingReceiptInfoCard"
import { OutsourcingReceiptItemsCard } from "@/features/outsourcing-receipts/components/detail/OutsourcingReceiptItemsCard"

export function OutsourcingReceiptDetailPage() {
  const { outsourcingReceiptId } = useParams({
    from: "/(authed)/manage_/outsourcing-receipts_/$outsourcingReceiptId",
  })

  const { data: receipt } = useSuspenseQuery(
    outsourcingReceiptQueryOptions(outsourcingReceiptId)
  )
  const { data: items } = useSuspenseQuery(
    outsourcingReceiptItemsQueryOptions(outsourcingReceiptId)
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết phiếu nhận gia công ngoài"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Gia công ngoài" },
          { label: "Nhập về (OS-IN)", href: "/manage/outsourcing-receipts" },
          { label: receipt.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface>
          <OutsourcingReceiptDetailHeader receipt={receipt} items={items} />
        </Surface>

        <OutsourcingReceiptInfoCard receipt={receipt} />
        <OutsourcingReceiptItemsCard items={items} />
      </div>
    </main>
  )
}
