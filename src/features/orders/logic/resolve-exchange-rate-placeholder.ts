// Fetch-state → placeholder text for the "Tỷ giá quy đổi" input — shared by
// CreateOrderInfoSection and UpdateOrderInfoSection's ExchangeRateField.
export function resolveExchangeRatePlaceholder(
  isFetching: boolean,
  rate: number | null | undefined
): string {
  if (isFetching) return "Đang lấy tỷ giá..."
  if (rate === null) return "Không lấy được tỷ giá, nhập tay"
  return "0"
}
