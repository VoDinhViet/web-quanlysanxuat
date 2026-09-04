import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { Surface } from "@/components/shared/layouts/Surface"
import { paymentRequestQueryOptions } from "@/features/payment-requests/api/options"
import { PaymentRequestDetailHeader } from "@/features/payment-requests/components/layouts/PaymentRequestDetailHeader"
import { PaymentRequestItemsSection } from "@/features/payment-requests/components/sections/PaymentRequestItemsSection"
import { PaymentRequestInfoCard } from "@/features/payment-requests/components/composites/PaymentRequestInfoCard"
import { PaymentRequestLogsCard } from "@/features/payment-requests/components/composites/PaymentRequestLogsCard"
import { PaymentRequestPrintSheet } from "@/features/payment-requests/components/composites/PaymentRequestPrintSheet"
import { PaymentRequestStatusHistoryCard } from "@/features/payment-requests/components/composites/PaymentRequestStatusHistoryCard"
import { PaymentRequestStatusNotice } from "@/features/payment-requests/components/composites/PaymentRequestStatusNotice"
import { PaymentRequestSupplierCard } from "@/features/payment-requests/components/composites/PaymentRequestSupplierCard"

export function PaymentRequestDetailPage() {
  const { paymentRequestId } = useParams({
    from: "/(authed)/manage_/payment-requests_/$paymentRequestId",
  })

  const { data: paymentRequest } = useSuspenseQuery(
    paymentRequestQueryOptions(paymentRequestId)
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết yêu cầu thanh toán"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý mua hàng" },
          {
            label: "Yêu cầu thanh toán",
            href: "/manage/payment-requests",
          },
          { label: paymentRequest.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <PaymentRequestStatusNotice paymentRequest={paymentRequest} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main content */}
          <div className="flex flex-col gap-4">
            <Surface>
              <PaymentRequestDetailHeader paymentRequest={paymentRequest} />
              <PaymentRequestItemsSection paymentRequest={paymentRequest} />
            </Surface>
            <PaymentRequestLogsCard paymentRequestId={paymentRequest.id} />
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <PaymentRequestSupplierCard paymentRequest={paymentRequest} />
            <PaymentRequestInfoCard paymentRequest={paymentRequest} />
            <PaymentRequestStatusHistoryCard paymentRequest={paymentRequest} />
          </div>
        </div>
      </div>

      <PaymentRequestPrintSheet
        paymentRequest={paymentRequest}
        className="print-sheet"
      />
    </main>
  )
}
