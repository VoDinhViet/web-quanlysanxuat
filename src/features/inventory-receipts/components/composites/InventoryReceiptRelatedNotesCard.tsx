import { useQuery } from "@tanstack/react-query"

import { RelatedNotesCard } from "@/components/shared/composites/RelatedNotesCard"
import { inventoryReceiptRelatedNotesQueryOptions } from "@/features/inventory-receipts/api/options"

type InventoryReceiptRelatedNotesCardProps = {
  receiptId: string
}

export function InventoryReceiptRelatedNotesCard({
  receiptId,
}: InventoryReceiptRelatedNotesCardProps) {
  const { data } = useQuery(inventoryReceiptRelatedNotesQueryOptions(receiptId))

  if (!data) {
    return null
  }

  return <RelatedNotesCard data={data} excludeId={receiptId} />
}
