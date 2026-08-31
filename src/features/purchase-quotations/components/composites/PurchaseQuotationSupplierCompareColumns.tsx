import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { DateTime } from "luxon"
import { CheckCircle } from "@solar-icons/react"

import { RadioGroupItem } from "@/components/ui/radio-group"
import type { PurchaseQuotationItemSupplierDetail } from "@/lib/types/purchase-quotation.type"

const purchaseQuotationSupplierColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PurchaseQuotationItemSupplierDetail
>()

const priceFormatter = new Intl.NumberFormat("vi-VN")

type BuildPurchaseQuotationSupplierCompareColumnsArgs = {
  selectable: boolean
  isApproved: boolean
}

// Read-only twin of CreateQuotationSuppliersQuoteColumns.tsx's inner columns — same header
// labels/widths, but every cell displays a value instead of editing one. The leading column is
// the one interactive/status surface: a radio while selecting a supplier (PENDING_APPROVAL), a
// "Trúng thầu" mark once approved, or empty otherwise.
export function buildPurchaseQuotationSupplierCompareColumns({
  selectable,
  isApproved,
}: BuildPurchaseQuotationSupplierCompareColumnsArgs) {
  return purchaseQuotationSupplierColumnHelper.columns([
    purchaseQuotationSupplierColumnHelper.display({
      id: "select",
      header: "Trúng thầu",
      meta: { headerClassName: "w-10 text-[10px]", cellClassName: "pl-3" },
      cell: ({ row }) => {
        const supplier = row.original

        if (selectable) {
          return (
            <RadioGroupItem
              value={supplier.id}
              aria-label={`Chọn ${supplier.supplier.name} thắng thầu`}
            />
          )
        }

        if (isApproved && supplier.selectedAt !== null) {
          return (
            <CheckCircle
              className="size-4 text-primary"
              aria-label="Trúng thầu"
            />
          )
        }

        return null
      },
    }),
    purchaseQuotationSupplierColumnHelper.accessor((row) => row.supplier.name, {
      id: "supplierName",
      header: "Nhà cung cấp",
      meta: {
        headerClassName: "text-[10px]",
        cellClassName: "truncate font-medium",
      },
    }),
    purchaseQuotationSupplierColumnHelper.display({
      id: "lastPrice",
      header: "Giá gần nhất",
      meta: { headerClassName: "w-40 text-[10px]" },
      cell: ({ row }) => {
        const lastPurchase = row.original.lastPurchase
        return lastPurchase ? (
          priceFormatter.format(lastPurchase.unitPrice)
        ) : (
          <span className="text-muted-foreground">Không có dữ liệu</span>
        )
      },
    }),
    purchaseQuotationSupplierColumnHelper.display({
      id: "lastPurchaseDate",
      header: "Ngày mua gần nhất",
      meta: { headerClassName: "w-32 text-[10px]" },
      cell: ({ row }) => {
        const lastPurchase = row.original.lastPurchase
        return lastPurchase
          ? DateTime.fromISO(lastPurchase.orderDate).toFormat("dd/MM/yyyy")
          : "—"
      },
    }),
    purchaseQuotationSupplierColumnHelper.accessor("unitPrice", {
      header: "Giá báo (VNĐ)",
      meta: {
        headerClassName: "w-44 text-[10px]",
        cellClassName: "font-medium",
      },
      cell: ({ getValue }) => {
        const unitPrice = getValue()
        return unitPrice === null ? "—" : priceFormatter.format(unitPrice)
      },
    }),
    purchaseQuotationSupplierColumnHelper.accessor("leadTimeDays", {
      header: "Leadtime (ngày)",
      meta: { headerClassName: "w-32 text-[10px]" },
      cell: ({ getValue }) => getValue() ?? "—",
    }),
    purchaseQuotationSupplierColumnHelper.accessor((row) => row.note ?? "—", {
      id: "note",
      header: "Ghi chú",
      meta: { headerClassName: "text-[10px]", cellClassName: "truncate" },
    }),
  ])
}
