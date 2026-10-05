import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Receipt } from "lucide-react"
import { useState } from "react"
import { NumericFormat } from "react-number-format"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { updatePurchaseOrder } from "@/features/purchase-orders/api/server-functions/update-purchase-order.api"
import { currencyFormatter } from "@/lib/currency"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderCostsSectionProps = {
  purchaseOrder: PurchaseOrderDetail
  editable: boolean
}

// "Chi phí và thuế" của cả đơn: % VAT, chi phí khác (số tiền + diễn giải). Chỉ nhập khi PO còn chờ
// xác nhận; sau đó chỉ xem. Mỗi ô lưu khi rời ô (cùng cách với đơn giá/ghi chú của PO), BE tính
// tiền VAT và tổng tiền nên màn chi tiết chỉ cần tải lại để thấy số mới.
export function PurchaseOrderCostsSection({
  purchaseOrder,
  editable,
}: PurchaseOrderCostsSectionProps) {
  const queryClient = useQueryClient()
  const updatePurchaseOrderFn = useServerFn(updatePurchaseOrder)

  const [vatPercent, setVatPercent] = useState(purchaseOrder.vatPercent)
  const [otherCost, setOtherCost] = useState(purchaseOrder.otherCost)
  const [otherCostNote, setOtherCostNote] = useState(
    purchaseOrder.otherCostNote ?? ""
  )

  const { mutate: save, isPending } = useMutation({
    mutationFn: (
      payload: Partial<
        Pick<PurchaseOrderDetail, "vatPercent" | "otherCost" | "otherCostNote">
      >
    ) =>
      updatePurchaseOrderFn({
        data: { purchaseOrderId: purchaseOrder.id, ...payload },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
    onError: (error) => {
      toast.error(error.message)
      setVatPercent(purchaseOrder.vatPercent)
      setOtherCost(purchaseOrder.otherCost)
      setOtherCostNote(purchaseOrder.otherCostNote ?? "")
    },
  })

  return (
    <div className="border-b border-border not-first:border-t">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase sm:px-5">
        <Receipt className="size-3.5 text-muted-foreground" />
        Chi phí và thuế
      </h3>

      {editable ? (
        <div className="grid gap-4 px-4 py-4 sm:grid-cols-[160px_220px_minmax(0,1fr)] sm:px-5">
          <div className="space-y-1">
            <label
              htmlFor="purchase-order-vat-percent"
              className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
            >
              Thuế VAT (%)
            </label>
            <NumericFormat
              id="purchase-order-vat-percent"
              customInput={Input}
              className="h-9 text-right tabular-nums"
              value={vatPercent}
              decimalSeparator=","
              thousandSeparator="."
              decimalScale={2}
              allowNegative={false}
              isAllowed={({ floatValue }) =>
                floatValue === undefined || floatValue <= 100
              }
              disabled={isPending}
              onValueChange={(values) => setVatPercent(values.floatValue ?? 0)}
              onBlur={() => {
                if (vatPercent === purchaseOrder.vatPercent) return
                save({ vatPercent })
              }}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="purchase-order-other-cost"
              className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
            >
              Chi phí khác (VNĐ)
            </label>
            <NumericFormat
              id="purchase-order-other-cost"
              customInput={Input}
              className="h-9 text-right tabular-nums"
              value={otherCost}
              decimalSeparator=","
              thousandSeparator="."
              decimalScale={2}
              allowNegative={false}
              disabled={isPending}
              onValueChange={(values) => setOtherCost(values.floatValue ?? 0)}
              onBlur={() => {
                if (otherCost === purchaseOrder.otherCost) return
                save({ otherCost })
              }}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="purchase-order-other-cost-note"
              className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
            >
              Diễn giải chi phí khác
            </label>
            <Input
              id="purchase-order-other-cost-note"
              className="h-9"
              maxLength={255}
              placeholder="Vd: Phí vận chuyển về kho"
              value={otherCostNote}
              disabled={isPending}
              onChange={(event) => setOtherCostNote(event.target.value)}
              onBlur={() => {
                if (otherCostNote === (purchaseOrder.otherCostNote ?? ""))
                  return
                save({ otherCostNote: otherCostNote.trim() || null })
              }}
            />
          </div>
        </div>
      ) : (
        <dl className="grid gap-4 px-4 py-4 sm:grid-cols-3 sm:px-5">
          <div className="space-y-1">
            <dt className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              Thuế VAT
            </dt>
            <dd className="text-sm font-medium text-foreground tabular-nums">
              {currencyFormatter.format(purchaseOrder.vatPercent)}%
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              Chi phí khác
            </dt>
            <dd className="text-sm font-medium text-foreground tabular-nums">
              {currencyFormatter.format(purchaseOrder.otherCost)} VNĐ
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              Diễn giải chi phí khác
            </dt>
            <dd className="text-sm font-medium text-foreground">
              {purchaseOrder.otherCostNote ?? "—"}
            </dd>
          </div>
        </dl>
      )}
    </div>
  )
}
