import { useParams } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { NumericFormat } from "react-number-format"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { updatePurchaseOrderItem } from "@/features/purchase-orders/api/server-functions/update-purchase-order-item.api"

const priceFormatter = new Intl.NumberFormat("vi-VN")

type PurchaseOrderItemUnitPriceCellProps = {
  purchaseOrderItemId: string
  itemName: string
  unitPrice: number | null
  editable: boolean
}

// Mirror PurchaseOrderItemQuantityCell.tsx — same commit-on-blur real PATCH, `unitPrice` is
// nullable on the wire (a line generated without a winning NCC price), so local state stays
// `number | null` and an empty/blank input is a valid (if incomplete) rendering, not an error.
export function PurchaseOrderItemUnitPriceCell({
  purchaseOrderItemId,
  itemName,
  unitPrice,
  editable,
}: PurchaseOrderItemUnitPriceCellProps) {
  const { purchaseOrderId } = useParams({
    from: "/(authed)/manage_/purchase-orders_/$purchaseOrderId",
  })
  const queryClient = useQueryClient()
  const updateItemFn = useServerFn(updatePurchaseOrderItem)
  const [value, setValue] = useState(unitPrice)

  const { mutate: save, isPending } = useMutation({
    mutationFn: (nextUnitPrice: number) =>
      updateItemFn({
        data: {
          purchaseOrderId,
          purchaseOrderItemId,
          unitPrice: nextUnitPrice,
        },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
    onError: (error) => {
      toast.error(error.message)
      setValue(unitPrice)
    },
  })

  if (!editable) {
    return (
      <span className="block text-right tabular-nums">
        {unitPrice === null ? "—" : priceFormatter.format(unitPrice)}
      </span>
    )
  }

  return (
    <NumericFormat
      customInput={Input}
      className="h-8 w-28 text-right text-xs tabular-nums"
      value={value ?? ""}
      thousandSeparator="."
      decimalSeparator=","
      allowNegative={false}
      placeholder="Nhập đơn giá"
      disabled={isPending}
      onValueChange={(values) => setValue(values.floatValue ?? null)}
      onBlur={() => {
        if (value === unitPrice) return

        if (value === null || !(value > 0)) {
          toast.error("Đơn giá PO phải lớn hơn 0.")
          setValue(unitPrice)
          return
        }

        save(value)
      }}
      aria-label={`Đơn giá PO cho ${itemName}`}
    />
  )
}
