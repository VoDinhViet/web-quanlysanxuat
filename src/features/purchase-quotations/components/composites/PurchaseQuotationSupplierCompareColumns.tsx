import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { CheckCircle } from "@solar-icons/react"
import { IconClock, IconFileDescription } from "@tabler/icons-react"
import { format, parseISO } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { QuotationSupplierAttachmentCell } from "@/features/purchase-quotations/components/primitives/QuotationSupplierAttachmentCell"
import { vnZone } from "@/lib/time"
import type { PurchaseQuotationItemSupplierDetail } from "@/lib/types/purchase-quotation.type"

const purchaseQuotationSupplierColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PurchaseQuotationItemSupplierDetail
>()

const priceFormatter = new Intl.NumberFormat("vi-VN")

type BuildPurchaseQuotationSupplierCompareColumnsArgs = {
  selectable: boolean
  isApproved: boolean
  itemQuantity?: number
  itemUnit?: string
  minPrice?: number
  minLeadTime?: number
}

export function buildPurchaseQuotationSupplierCompareColumns({
  selectable,
  isApproved,
  itemQuantity,
  itemUnit,
  minPrice,
  minLeadTime,
}: BuildPurchaseQuotationSupplierCompareColumnsArgs) {
  return purchaseQuotationSupplierColumnHelper.columns([
    // Cột 1: Chọn trúng thầu (khi duyệt) hoặc Badge Trúng thầu (khi đã duyệt)
    purchaseQuotationSupplierColumnHelper.display({
      id: "select",
      header: "Trúng thầu",
      meta: {
        headerClassName: "w-28 text-center text-xs",
        cellClassName: "text-center",
      },
      cell: ({ row }) => {
        const supplier = row.original

        if (selectable) {
          return (
            <div className="flex items-center justify-center">
              <RadioGroupItem
                value={supplier.id}
                aria-label={`Chọn ${supplier.supplier.name} thắng thầu`}
              />
            </div>
          )
        }

        if (isApproved && supplier.selectedAt !== null) {
          return (
            <Badge
              variant="success"
              appearance="soft"
              className="gap-1 text-[11px] font-medium"
            >
              <CheckCircle className="size-3.5" />
              Trúng thầu
            </Badge>
          )
        }

        return <span className="text-xs text-muted-foreground">—</span>
      },
    }),

    // Cột 2: Nhà cung cấp & Lịch sử mua gần nhất (2 tầng thông tin)
    purchaseQuotationSupplierColumnHelper.accessor((row) => row.supplier.name, {
      id: "supplierName",
      header: "Nhà cung cấp & Lịch sử",
      meta: {
        headerClassName: "text-xs min-w-[220px]",
        cellClassName: "py-2.5",
      },
      cell: ({ row }) => {
        const supplier = row.original
        const lastPurchase = supplier.lastPurchase
        const isLowestPrice =
          minPrice !== undefined &&
          supplier.unitPrice !== null &&
          supplier.unitPrice !== undefined &&
          supplier.unitPrice === minPrice

        return (
          <div className="space-y-0.5">
            {/* Tầng 1: Tên NCC + Badge Giá thấp nhất */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-medium text-foreground">
                {supplier.supplier.name}
              </span>
              {isLowestPrice && (
                <Badge
                  variant="info"
                  appearance="soft"
                  className="px-1.5 py-0 text-[10px] font-semibold tracking-wide uppercase"
                >
                  Giá thấp nhất
                </Badge>
              )}
            </div>

            {/* Tầng 2: Lịch sử mua gần nhất */}
            <p className="text-xs text-muted-foreground tabular-nums">
              {lastPurchase ? (
                <>
                  <span>Lịch sử mua: </span>
                  <span className="font-medium text-foreground">
                    {priceFormatter.format(lastPurchase.unitPrice)} ₫
                  </span>
                  <span>
                    {" "}
                    (
                    {format(
                      parseISO(lastPurchase.orderDate, { in: vnZone }),
                      "dd/MM/yyyy"
                    )}
                    )
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground/80">
                  Chưa từng mua trước đây
                </span>
              )}
            </p>
          </div>
        )
      },
    }),

    // Cột 3: Đơn giá & Đơn vị báo giá (chỉ rõ ĐVT của NCC hay ĐVT gốc)
    purchaseQuotationSupplierColumnHelper.display({
      id: "unitPriceAndSpec",
      header: "Đơn giá & Quy cách",
      meta: {
        headerClassName: "w-48 text-xs text-right",
        cellClassName: "text-right py-2.5",
      },
      cell: ({ row }) => {
        const supplier = row.original
        const unitPrice = supplier.unitPrice
        const isSupplierUnit =
          Boolean(supplier.quotationUnit?.trim()) &&
          supplier.quotationUnit?.trim().toLowerCase() !==
            itemUnit?.trim().toLowerCase()
        const quoteUnit = supplier.quotationUnit || itemUnit || ""

        return (
          <div className="space-y-0.5">
            {/* Tầng 1: Đơn giá báo kèm ĐVT áp dụng */}
            <p className="text-xs font-semibold text-foreground tabular-nums">
              {unitPrice !== null && unitPrice !== undefined ? (
                <>
                  <span>{priceFormatter.format(unitPrice)} ₫</span>
                  <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                    / {quoteUnit}
                  </span>
                </>
              ) : (
                "—"
              )}
            </p>

            {/* Tầng 2: Nhãn phân biệt rõ ĐVT của NCC hay ĐVT gốc */}
            <p className="text-[11px] tabular-nums">
              {isSupplierUnit ? (
                <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                  <span>Theo ĐVT NCC:</span>
                  <strong>
                    {supplier.quotationQuantity?.toLocaleString("vi-VN")}{" "}
                    {supplier.quotationUnit}
                  </strong>
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Theo ĐVT gốc: {itemQuantity?.toLocaleString("vi-VN")}{" "}
                  {itemUnit}
                </span>
              )}
            </p>
          </div>
        )
      },
    }),

    // Cột 4: Thành tiền quy đổi & Diễn giải cơ sở quy đổi
    purchaseQuotationSupplierColumnHelper.display({
      id: "totalAmount",
      header: "Thành tiền quy đổi",
      meta: {
        headerClassName: "w-52 text-xs text-right",
        cellClassName: "text-right py-2.5",
      },
      cell: ({ row }) => {
        const supplier = row.original
        if (supplier.unitPrice === null || supplier.unitPrice === undefined) {
          return <span className="text-xs text-muted-foreground">—</span>
        }

        const isSupplierUnit =
          Boolean(supplier.quotationUnit?.trim()) &&
          supplier.quotationUnit?.trim().toLowerCase() !==
            itemUnit?.trim().toLowerCase()

        const effectiveQty = supplier.quotationQuantity ?? itemQuantity ?? 0
        const total = supplier.unitPrice * effectiveQty
        const quoteUnit = supplier.quotationUnit || itemUnit || ""

        return (
          <div className="space-y-0.5">
            {/* Tầng 1: Tổng tiền nổi bật */}
            <p className="text-xs font-bold text-primary tabular-nums">
              {priceFormatter.format(total)} ₫
            </p>

            {/* Tầng 2: Diễn giải quy đổi chi tiết */}
            {isSupplierUnit ? (
              <div className="space-y-0.2 text-[10.5px] tabular-nums">
                <p className="text-muted-foreground">
                  = {priceFormatter.format(supplier.unitPrice)} ×{" "}
                  {effectiveQty.toLocaleString("vi-VN")} {quoteUnit}
                </p>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  (Quy đổi cho {itemQuantity?.toLocaleString("vi-VN")}{" "}
                  {itemUnit} gốc)
                </p>
              </div>
            ) : (
              <div className="text-[10.5px] tabular-nums">
                <p className="text-muted-foreground">
                  = {priceFormatter.format(supplier.unitPrice)} ×{" "}
                  {effectiveQty.toLocaleString("vi-VN")} {itemUnit}
                </p>
                <p className="text-muted-foreground/75">(Dựa trên ĐVT gốc)</p>
              </div>
            )}
          </div>
        )
      },
    }),

    // Cột 5: Tiến độ (isShortestLeadTime), Tệp & Ghi chú (2 tầng thông tin)
    purchaseQuotationSupplierColumnHelper.display({
      id: "leadTimeAndNotes",
      header: "Tiến độ & Ghi chú",
      meta: {
        headerClassName: "w-52 text-xs text-left",
        cellClassName: "py-2.5",
      },
      cell: ({ row }) => {
        const supplier = row.original
        const leadTime = supplier.leadTimeDays
        const hasNote = Boolean(supplier.note?.trim())
        const isShortestLeadTime =
          minLeadTime !== undefined &&
          leadTime !== null &&
          leadTime !== undefined &&
          leadTime === minLeadTime

        return (
          <div className="space-y-1">
            {/* Tầng 1: Leadtime + Badge Giao nhanh nhất (isShortestLeadTime) */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-foreground">
              <IconClock className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="font-medium tabular-nums">
                {leadTime !== null && leadTime !== undefined
                  ? `Giao: ${leadTime} ngày`
                  : "Chưa rõ tiến độ"}
              </span>
              {isShortestLeadTime && (
                <Badge
                  variant="success"
                  appearance="soft"
                  className="px-1.5 py-0 text-[10px] font-semibold tracking-wide uppercase"
                >
                  Nhanh nhất
                </Badge>
              )}
            </div>

            {/* Tầng 2: Tệp đính kèm & Ghi chú */}
            <div className="flex items-center gap-2 text-xs">
              <QuotationSupplierAttachmentCell
                supplierName={supplier.supplier.name}
                value={supplier.files}
                disabled={true}
              />

              {hasNote && (
                <span
                  className="inline-flex max-w-[140px] items-center gap-1 truncate text-[11px] text-muted-foreground"
                  title={supplier.note ?? undefined}
                >
                  <IconFileDescription className="size-3 shrink-0" />
                  <span className="truncate">{supplier.note}</span>
                </span>
              )}
            </div>
          </div>
        )
      },
    }),
  ])
}
