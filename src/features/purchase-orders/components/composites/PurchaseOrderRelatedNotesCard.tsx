import { useQuery } from "@tanstack/react-query"

import { RelatedNotesCard } from "@/components/shared/composites/RelatedNotesCard"
import { purchaseOrderRelatedNotesQueryOptions } from "@/features/purchase-orders/api/options"

type PurchaseOrderRelatedNotesCardProps = {
  purchaseOrderId: string
}

export function PurchaseOrderRelatedNotesCard({
  purchaseOrderId,
}: PurchaseOrderRelatedNotesCardProps) {
  const { data } = useQuery(
    purchaseOrderRelatedNotesQueryOptions(purchaseOrderId)
  )

  if (!data) {
    return null
  }

  return <RelatedNotesCard data={data} excludeId={purchaseOrderId} />
}
