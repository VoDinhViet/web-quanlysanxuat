import { useMemo, useState, useEffect } from "react"
import { useParams } from "@tanstack/react-router"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { Surface } from "@/components/shared/layouts/Surface"
import { paymentRequestQueryOptions } from "@/features/payment-requests/api/options"
import { updatePaymentRequestExtraCost } from "@/features/payment-requests/api/server-functions/update-payment-request-extra-cost.api"
import { PaymentRequestDetailHeader } from "@/features/payment-requests/components/layouts/PaymentRequestDetailHeader"
import { PaymentRequestItemsSection } from "@/features/payment-requests/components/sections/PaymentRequestItemsSection"
import { PaymentRequestInfoCard } from "@/features/payment-requests/components/composites/PaymentRequestInfoCard"
import { PaymentRequestLogsCard } from "@/features/payment-requests/components/composites/PaymentRequestLogsCard"
import { PaymentRequestPrintSheet } from "@/features/payment-requests/components/composites/PaymentRequestPrintSheet"
import { PaymentRequestStatusHistoryCard } from "@/features/payment-requests/components/composites/PaymentRequestStatusHistoryCard"
import { PaymentRequestStatusNotice } from "@/features/payment-requests/components/composites/PaymentRequestStatusNotice"
import { PaymentRequestSupplierCard } from "@/features/payment-requests/components/composites/PaymentRequestSupplierCard"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

/**
 * Tính toán số liệu thực tế của YCTT khi có chi phí phát sinh sau đặt hàng.
 * Số thanh toán cuối cùng = Tổng PO − Tạm ứng + Chi phí phát sinh.
 */
function calculateEffectivePaymentRequest(
  original: PaymentRequestDetail,
  extraCost: number,
  extraCostNote: string | null
): PaymentRequestDetail {
  return {
    ...original,
    extraCost,
    extraCostNote,
    requestedAmount:
      original.purchaseOrderTotalAmount -
      original.advancePaymentAmount +
      extraCost,
  }
}

export function PaymentRequestDetailPage() {
  const { paymentRequestId } = useParams({
    from: "/(authed)/manage_/payment-requests_/$paymentRequestId",
  })

  const { data: paymentRequest } = useSuspenseQuery(
    paymentRequestQueryOptions(paymentRequestId)
  )

  const [extraCost, setExtraCost] = useState<number>(
    paymentRequest.extraCost ?? 0
  )
  const [extraCostNote, setExtraCostNote] = useState<string | null>(
    paymentRequest.extraCostNote ?? null
  )

  useEffect(() => {
    setExtraCost(paymentRequest.extraCost ?? 0)
    setExtraCostNote(paymentRequest.extraCostNote ?? null)
  }, [paymentRequest.extraCost, paymentRequest.extraCostNote])

  const savedExtraCost = paymentRequest.extraCost ?? 0
  const savedExtraCostNote = paymentRequest.extraCostNote?.trim() || null
  const currentNote = extraCostNote?.trim() || null

  const hasUnsavedChanges =
    extraCost !== savedExtraCost || currentNote !== savedExtraCostNote

  const queryClient = useQueryClient()
  const updateExtraCostFn = useServerFn(updatePaymentRequestExtraCost)

  const { mutate: saveExtraCost, isPending: isSavingExtraCost } = useMutation({
    mutationFn: () =>
      updateExtraCostFn({
        data: {
          paymentRequestId: paymentRequest.id,
          extraCost,
          extraCostNote: currentNote,
        },
      }),
    onSuccess: () => {
      toast.success("Đã ghi nhận chi phí phát sinh.")
      void queryClient.invalidateQueries({ queryKey: ["payment-requests"] })
    },
    onError: (error) => toast.error(error.message),
  })

  const handleRevert = () => {
    setExtraCost(paymentRequest.extraCost ?? 0)
    setExtraCostNote(paymentRequest.extraCostNote ?? null)
  }

  const effectivePaymentRequest = useMemo(
    () => calculateEffectivePaymentRequest(paymentRequest, extraCost, extraCostNote),
    [paymentRequest, extraCost, extraCostNote]
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
        <PaymentRequestStatusNotice paymentRequest={effectivePaymentRequest} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main content */}
          <div className="flex flex-col gap-4">
            <Surface>
              <PaymentRequestDetailHeader
                paymentRequest={effectivePaymentRequest}
                hasUnsavedChanges={hasUnsavedChanges}
                isSaving={isSavingExtraCost}
                onSave={() => saveExtraCost()}
                onRevert={handleRevert}
              />
              <PaymentRequestItemsSection
                paymentRequest={effectivePaymentRequest}
                currentExtraCost={extraCost}
                currentExtraCostNote={extraCostNote ?? ""}
                hasUnsavedChanges={hasUnsavedChanges}
                isSaving={isSavingExtraCost}
                onExtraCostChange={({ extraCost: nextCost, extraCostNote: nextNote }) => {
                  setExtraCost(nextCost)
                  setExtraCostNote(nextNote)
                }}
                onSave={() => saveExtraCost()}
                onRevert={handleRevert}
              />
            </Surface>
            <PaymentRequestLogsCard paymentRequestId={paymentRequest.id} />
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <PaymentRequestSupplierCard paymentRequest={effectivePaymentRequest} />
            <PaymentRequestInfoCard paymentRequest={effectivePaymentRequest} />
            <PaymentRequestStatusHistoryCard paymentRequest={effectivePaymentRequest} />
          </div>
        </div>
      </div>

      <PaymentRequestPrintSheet
        paymentRequest={effectivePaymentRequest}
        className="print-sheet"
      />
    </main>
  )
}
