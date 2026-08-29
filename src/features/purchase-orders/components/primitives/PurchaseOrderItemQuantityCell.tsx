import { useParams } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { NumericFormat } from "react-number-format"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { updatePurchaseOrderItem } from "@/features/purchase-orders/api/server-functions/update-purchase-order-item.api"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type PurchaseOrderItemQuantityCellProps = {
  purchaseOrderItemId: string
  itemName: string
  quantity: number
  editable: boolean
}

// Mirror PurchaseRequestItemQuantityCell.tsx — real PATCH .../items/:id, saved on blur (not per
// keystroke, to avoid the focus-loss bug hit during the create-RFQ flow). `purchaseOrderId` is a
// route param, read via `useParams` rather than threaded down through Section → columns factory.
export function PurchaseOrderItemQuantityCell({
  purchaseOrderItemId,
  itemName,
  quantity,
  editable,
}: PurchaseOrderItemQuantityCellProps) {
  const { purchaseOrderId } = useParams({
    from: "/(authed)/manage_/purchase-orders_/$purchaseOrderId",
  })
  const queryClient = useQueryClient()
  const updateItemFn = useServerFn(updatePurchaseOrderItem)
  const [value, setValue] = useState(quantity)

  const { mutate: save, isPending } = useMutation({
    mutationFn: (nextQuantity: number) =>
      updateItemFn({
        data: { purchaseOrderId, purchaseOrderItemId, quantity: nextQuantity },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
    onError: (error) => {
      toast.error(error.message)
      setValue(quantity)
    },
  })

  if (!editable) {
    return (
      <span className="block text-right tabular-nums">
        {quantityFormatter.format(quantity)}
      </span>
    )
  }

  return (
    <NumericFormat
      customInput={Input}
      className="h-8 w-24 text-right text-xs tabular-nums"
      value={value}
      thousandSeparator="."
      decimalSeparator=","
      allowNegative={false}
      disabled={isPending}
      onValueChange={(values) => setValue(values.floatValue ?? 0)}
      onBlur={() => {
        if (value === quantity) return

        if (!(value > 0)) {
          toast.error("SL đặt phải lớn hơn 0.")
          setValue(quantity)
          return
        }

        save(value)
      }}
      aria-label={`SL đặt cho ${itemName}`}
    />
  )
}
