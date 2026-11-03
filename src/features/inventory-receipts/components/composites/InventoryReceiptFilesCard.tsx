import { useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { DocumentFilesCard } from "@/components/shared/composites/DocumentFilesCard"
import { inventoryReceiptQueryOptions } from "@/features/inventory-receipts/api/options"
import { updateInventoryReceiptFiles } from "@/features/inventory-receipts/api/server-functions/update-inventory-receipt-files.api"
import { UploadType } from "@/lib/types/file.type"
import { InventoryReceiptStatus } from "@/lib/types/inventory-receipt.type"
import type { InventoryReceiptDetail } from "@/lib/types/inventory-receipt.type"

type InventoryReceiptFilesCardProps = {
  inventoryReceipt: Pick<InventoryReceiptDetail, "id" | "status" | "files">
}

export function InventoryReceiptFilesCard({
  inventoryReceipt,
}: InventoryReceiptFilesCardProps) {
  const queryClient = useQueryClient()
  const updateFilesFn = useServerFn(updateInventoryReceiptFiles)

  return (
    <DocumentFilesCard
      className="lg:col-span-2 xl:col-span-3"
      files={inventoryReceipt.files}
      uploadType={UploadType.INVENTORY_RECEIPT_DOCUMENT}
      permission="inventory:update"
      isLocked={inventoryReceipt.status === InventoryReceiptStatus.CANCELLED}
      onSave={async (fileIds) => {
        await updateFilesFn({
          data: { receiptId: inventoryReceipt.id, fileIds },
        })
        await queryClient.invalidateQueries({
          queryKey: inventoryReceiptQueryOptions(inventoryReceipt.id).queryKey,
        })
      }}
    />
  )
}
