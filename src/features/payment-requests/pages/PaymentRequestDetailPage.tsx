import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { paymentRequestQueryOptions } from "@/features/payment-requests/api/options"
import { PaymentRequestDetailHeader } from "@/features/payment-requests/components/detail/PaymentRequestDetailHeader"
import { PaymentRequestItemsSection } from "@/features/payment-requests/components/detail/PaymentRequestItemsSection"
import { PaymentRequestInfoCard } from "@/features/payment-requests/components/detail/PaymentRequestInfoCard"
import { PaymentRequestStatusHistoryCard } from "@/features/payment-requests/components/detail/PaymentRequestStatusHistoryCard"

export function PaymentRequestDetailPage() {
  const { paymentRequestId } = useParams({
    from: "/(authed)/manage_/payment-requests_/$paymentRequestId",
  })

  const { data: detail } = useSuspenseQuery(
    paymentRequestQueryOptions(paymentRequestId)
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết yêu cầu thanh toán"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý mua hàng" },
          {
            label: "Yêu cầu thanh toán",
            href: "/manage/payment-requests",
          },
          { label: detail.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main content */}
          <Surface>
            <PaymentRequestDetailHeader detail={detail} />
            <PaymentRequestItemsSection detail={detail} />
          </Surface>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <PaymentRequestInfoCard detail={detail} />
            <PaymentRequestStatusHistoryCard detail={detail} />
          </div>
        </div>
      </div>
    </main>
  )
}
