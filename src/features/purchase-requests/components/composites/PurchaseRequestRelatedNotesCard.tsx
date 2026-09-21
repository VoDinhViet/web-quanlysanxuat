import { useQuery } from "@tanstack/react-query"

import { RelatedNotesCard } from "@/components/shared/composites/RelatedNotesCard"
import { purchaseRequestRelatedNotesQueryOptions } from "@/features/purchase-requests/api/options"

type PurchaseRequestRelatedNotesCardProps = {
  purchaseRequestId: string
}

export function PurchaseRequestRelatedNotesCard({
  purchaseRequestId,
}: PurchaseRequestRelatedNotesCardProps) {
  const { data } = useQuery(
    purchaseRequestRelatedNotesQueryOptions(purchaseRequestId)
  )

  if (!data) {
    return null
  }

  return <RelatedNotesCard data={data} excludeId={purchaseRequestId} />
}
