import { useQuery } from "@tanstack/react-query"

import { RelatedNotesCard } from "@/components/shared/composites/RelatedNotesCard"
import { purchaseQuotationRelatedNotesQueryOptions } from "@/features/purchase-quotations/api/options"

type PurchaseQuotationRelatedNotesCardProps = {
  purchaseQuotationId: string
}

export function PurchaseQuotationRelatedNotesCard({
  purchaseQuotationId,
}: PurchaseQuotationRelatedNotesCardProps) {
  const { data } = useQuery(
    purchaseQuotationRelatedNotesQueryOptions(purchaseQuotationId)
  )

  if (!data) {
    return null
  }

  return <RelatedNotesCard data={data} excludeId={purchaseQuotationId} />
}
