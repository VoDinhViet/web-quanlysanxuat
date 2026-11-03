import { useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { DocumentFilesCard } from "@/components/shared/composites/DocumentFilesCard"
import { paymentRequestQueryOptions } from "@/features/payment-requests/api/options"
import { updatePaymentRequestFiles } from "@/features/payment-requests/api/server-functions/update-payment-request-files.api"
import { UploadType } from "@/lib/types/file.type"
import { PaymentRequestStatus } from "@/lib/types/payment-request.type"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type PaymentRequestFilesCardProps = {
  paymentRequest: Pick<PaymentRequestDetail, "id" | "status" | "files">
}

export function PaymentRequestFilesCard({
  paymentRequest,
}: PaymentRequestFilesCardProps) {
  const queryClient = useQueryClient()
  const updateFilesFn = useServerFn(updatePaymentRequestFiles)

  return (
    <DocumentFilesCard
      files={paymentRequest.files}
      uploadType={UploadType.PAYMENT_REQUEST_DOCUMENT}
      permission="purchasing:update"
      isLocked={paymentRequest.status === PaymentRequestStatus.CANCELLED}
      onSave={async (fileIds) => {
        await updateFilesFn({
          data: { paymentRequestId: paymentRequest.id, fileIds },
        })
        await queryClient.invalidateQueries({
          queryKey: paymentRequestQueryOptions(paymentRequest.id).queryKey,
        })
      }}
    />
  )
}
