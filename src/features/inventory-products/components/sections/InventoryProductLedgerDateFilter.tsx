import { useNavigate, useSearch } from "@tanstack/react-router"

import { DateRangePicker } from "@/components/shared/composites/DateRangePicker"

// Lives beside the "Thẻ kho thành phẩm" section label in InventoryProductDetailPage.tsx, not
// inside the ledger panel itself. Applies immediately on change — same immediate-apply
// convention every other filter in this app follows (no "Lọc" batched-apply button precedent
// exists anywhere).
export function InventoryProductLedgerDateFilter() {
  const search = useSearch({
    from: "/(authed)/manage_/inventory-products_/$itemId",
  })
  const navigate = useNavigate({
    from: "/manage/inventory-products/$itemId",
  })

  const handleChange = (range: {
    from: string | undefined
    to: string | undefined
  }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        startDate: range.from,
        endDate: range.to,
        page: 1,
      }),
    })
  }

  return (
    <div className="w-full max-w-72 py-2">
      <DateRangePicker
        id="inventory-product-ledger-date-range"
        from={search.startDate}
        to={search.endDate}
        onChange={handleChange}
      />
    </div>
  )
}
