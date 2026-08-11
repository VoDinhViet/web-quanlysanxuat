import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updatePurchaseOrder } from "@/features/purchase-orders/api/server-functions/update-purchase-order.api"
import { warehouseOptionsQueryOptions } from "@/features/warehouses/api"
import type { WarehouseRef } from "@/lib/types/warehouse.type"

const UNSET = "unset"

type PurchaseOrderReceiptWarehouseFieldProps = {
  purchaseOrderId: string
  receiptWarehouse: WarehouseRef | null
  editable: boolean
}

// Mirror PurchaseOrderPaymentTermField.tsx's shape — a plain <Select> fed by the warehouses
// reference list (client-side read; the route doesn't prefetch it since it's only needed once
// editing), commit on change.
export function PurchaseOrderReceiptWarehouseField({
  purchaseOrderId,
  receiptWarehouse,
  editable,
}: PurchaseOrderReceiptWarehouseFieldProps) {
  const queryClient = useQueryClient()
  const updatePurchaseOrderFn = useServerFn(updatePurchaseOrder)
  const [value, setValue] = useState(receiptWarehouse?.id ?? UNSET)
  const { data: warehouses = [] } = useQuery({
    ...warehouseOptionsQueryOptions(),
    enabled: editable,
  })

  const { mutate: save } = useMutation({
    mutationFn: (receiptWarehouseId: string | null) =>
      updatePurchaseOrderFn({
        data: { purchaseOrderId, receiptWarehouseId },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
    onError: (error) => {
      toast.error(error.message)
      setValue(receiptWarehouse?.id ?? UNSET)
    },
  })

  if (!editable) {
    return (
      <div className="min-w-0 space-y-1">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Kho nhận hàng
        </p>
        <p className="truncate text-sm font-medium text-foreground">
          {receiptWarehouse?.name ?? "Chưa chọn"}
        </p>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-1">
      <label
        htmlFor="purchase-order-receipt-warehouse"
        className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
      >
        Kho nhận hàng
      </label>
      <Select
        value={value}
        onValueChange={(nextValue: string) => {
          setValue(nextValue)
          save(nextValue === UNSET ? null : nextValue)
        }}
      >
        <SelectTrigger
          id="purchase-order-receipt-warehouse"
          className="h-9 w-full bg-background text-xs"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNSET}>Chưa chọn</SelectItem>
          {warehouses.map((warehouse) => (
            <SelectItem key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
