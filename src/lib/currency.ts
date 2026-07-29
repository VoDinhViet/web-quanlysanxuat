// Shared vi-VN money formatters — every place that displays an amount in an order's own
// currency, or a VND amount/conversion, reuses these two instances instead of each
// redeclaring its own `new Intl.NumberFormat(...)` (previously duplicated across
// Create/UpdateOrderTotalsSummary.tsx, Create/UpdateOrderItemsSection.tsx,
// OrderItemDialog.tsx, order-stat-tiles.ts).

// An amount in whatever currency the order itself uses (VND, USD, ...) — up to 2 decimals,
// matching the backend's own `round(..., 2)` at every money step (see
// OrdersService.recalculateTotals).
export const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
})

// A VND amount specifically — an order's total converted via exchangeRate, or a dashboard
// stat already computed in VND server-side. VND has no sub-unit, so 0 decimals.
export const vndFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
})
