// Shared by orders, purchase-orders and suppliers — all three mirror the same backend enum
// (`payment_term` pg enum, `be-quanlysanxuat/src/database/schemas/suppliers/
// supplier-payment-info.ts`). Previously declared three times over (once per domain type
// file, one as a native `enum`), which is exactly the kind of duplication `src/lib/types/`
// exists to hold once.
export const PaymentTerm = {
  IMMEDIATE: "IMMEDIATE",
  NET_15: "NET_15",
  NET_30: "NET_30",
  NET_60: "NET_60",
} as const

export type PaymentTerm = (typeof PaymentTerm)[keyof typeof PaymentTerm]

/** "Net X ngày" wording — purchasing side (điều khoản trả cho NCC): purchase-orders,
 *  suppliers. */
export const paymentTermLabels: Record<PaymentTerm, string> = {
  [PaymentTerm.IMMEDIATE]: "Thanh toán ngay",
  [PaymentTerm.NET_15]: "Net 15 ngày",
  [PaymentTerm.NET_30]: "Net 30 ngày",
  [PaymentTerm.NET_60]: "Net 60 ngày",
}

/** "TT X ngày" wording — orders' own short form for its narrow list column (điều khoản thu
 *  từ khách hàng). */
export const paymentTermShortLabels: Record<PaymentTerm, string> = {
  [PaymentTerm.IMMEDIATE]: "TT ngay",
  [PaymentTerm.NET_15]: "TT 15 ngày",
  [PaymentTerm.NET_30]: "TT 30 ngày",
  [PaymentTerm.NET_60]: "TT 60 ngày",
}
