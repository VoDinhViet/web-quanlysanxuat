import type { OrderItemFormValue } from "@/features/orders/schemas/order-item-form.schema"
import { currencyFormatter } from "@/lib/currency"
import { OrderDiscountType, OrderItemStatus } from "@/lib/types/order.type"
import { roundMoney } from "@/lib/utils"

export type OrderTotals = {
  subtotal: number
  discountAmount: number
  vatAmount: number
  total: number
  totalVnd: number
}

// Mirrors OrdersService.recalculateTotals exactly (be-quanlysanxuat) so the
// preview matches what the server will compute — this is still only an
// estimate, the authoritative numbers come back on the created order.
export function computeOrderTotals(
  items: OrderItemFormValue[],
  discountType: OrderDiscountType,
  discountValue: number,
  vatPercent: number,
  shippingFee: number,
  exchangeRate: number
): OrderTotals {
  const subtotal = items
    .filter((item) => item.status !== OrderItemStatus.CANCELLED)
    .reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0
      const unitPrice = Number(item.unitPrice) || 0
      const discountPercent = Number(item.discountPercent) || 0

      return (
        sum + roundMoney(quantity * unitPrice * (1 - discountPercent / 100))
      )
    }, 0)

  const discountAmount =
    discountType === OrderDiscountType.PERCENT
      ? roundMoney((subtotal * discountValue) / 100)
      : discountValue

  const vatAmount = roundMoney(((subtotal - discountAmount) * vatPercent) / 100)
  const total = subtotal - discountAmount + vatAmount + shippingFee
  const totalVnd = roundMoney(total * exchangeRate)

  return { subtotal, discountAmount, vatAmount, total, totalVnd }
}

// Renders "" for a zero amount instead of a bare "+0"/"−0" — a sign in front
// of nothing reads as a rendering glitch, not as information.
export function formatSignedAmount(amount: number, sign: "+" | "−"): string {
  return amount > 0
    ? `${sign}${currencyFormatter.format(amount)}`
    : currencyFormatter.format(0)
}
