import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Image } from "@unpic/react"
import { FileText, Gallery } from "@solar-icons/react"
import { ArrowUpRight, ChevronDown } from "lucide-react"
import type { ReactNode } from "react"
import prettyBytes from "pretty-bytes"

import { LinkButton } from "@/components/ui/button"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { resolveFileUrl } from "@/lib/file-url"
import type { OrderItemRef } from "@/lib/types/order.type"
import type { ProductionOrderDetailItem } from "@/lib/types/production-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const productionOrderItemsColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  ProductionOrderDetailItem
>()

type BuildProductionOrderItemsColumnsArgs = {
  // Rendered by the caller (where `form` is fully typed via `withForm`) rather than taking
  // `form` here — `AnyFormApi` doesn't carry the `.Field` render-prop typings, only the
  // concrete `useAppForm`/`withForm` instance does.
  renderQuantityCell: (
    item: ProductionOrderDetailItem,
    index: number
  ) => ReactNode
}

export function buildProductionOrderItemsColumns({
  renderQuantityCell,
}: BuildProductionOrderItemsColumnsArgs) {
  return productionOrderItemsColumnHelper.columns([
    productionOrderItemsColumnHelper.display({
      id: "index",
      header: "#",
      meta: {
        headerClassName: "w-10 text-center",
        cellClassName: "text-center text-muted-foreground",
      },
      cell: ({ row }) => row.index + 1,
    }),
    productionOrderItemsColumnHelper.display({
      id: "product",
      header: "Sản phẩm",
      meta: { headerClassName: "min-w-64" },
      cell: ({ row }) => {
        const { item } = row.original

        return (
          <div className="flex min-w-0 items-center gap-3 py-1">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
              {item.image ? (
                <Image
                  src={resolveFileUrl(item.image.url)}
                  alt={item.name}
                  layout="fullWidth"
                  objectFit="cover"
                  className="size-full"
                />
              ) : (
                <Gallery className="size-4 text-muted-foreground/50" />
              )}
            </div>
            <div className="min-w-0">
              <Link
                to="/manage/products/$productId"
                params={{ productId: item.id }}
                search={{ tab: "info" }}
                className="block truncate font-medium text-foreground hover:text-primary hover:underline"
                title="Nhấn để xem chi tiết sản phẩm"
              >
                {item.name}
              </Link>
              <p className="truncate font-mono text-[11px] text-muted-foreground">
                {item.code}
                {item.revision ? ` · ${item.revision}` : ""}
              </p>
            </div>
          </div>
        )
      },
    }),
    productionOrderItemsColumnHelper.accessor(
      (item) => item.item.unit?.name ?? "—",
      {
        id: "unit",
        header: "ĐVT",
        meta: {
          headerClassName: "w-20 text-center",
          cellClassName: "text-center text-muted-foreground",
        },
      }
    ),
    productionOrderItemsColumnHelper.display({
      id: "drawings",
      header: "Bản vẽ",
      meta: { headerClassName: "min-w-44" },
      cell: ({ row }) => <ProductDrawingsCell item={row.original.item} />,
    }),
    productionOrderItemsColumnHelper.accessor("orderQty", {
      header: "SL theo đơn hàng",
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    productionOrderItemsColumnHelper.accessor("onHandQty", {
      header: "Tồn kho TP (Hiện có)",
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right font-medium text-info tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    productionOrderItemsColumnHelper.accessor("availableQty", {
      header: "Tồn kho TP (Khả dụng)",
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right font-medium text-info tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    productionOrderItemsColumnHelper.display({
      id: "quantity",
      header: "Số lượng sản xuất",
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => renderQuantityCell(row.original, row.index),
    }),
    productionOrderItemsColumnHelper.accessor("fromStockQty", {
      header: "Lấy từ tồn",
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right text-muted-foreground tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
  ])
}

type ProductDrawingsCellProps = {
  item: OrderItemRef
}

function ProductDrawingsCell({ item }: ProductDrawingsCellProps) {
  const files = item.files ?? []

  if (files.length === 0) {
    return <span className="font-mono text-xs text-muted-foreground/40">—</span>
  }

  const firstFile = files[0]
  const extraCount = files.length - 1

  if (files.length === 1) {
    return (
      <a
        href={resolveFileUrl(firstFile.file.url)}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex max-w-44 items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-xs text-foreground transition-all hover:border-primary/40 hover:bg-muted/70 hover:text-primary"
        title={`${firstFile.file.originalName} (Nhấn để mở)`}
      >
        <FileText className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        <span className="truncate">{firstFile.file.originalName}</span>
        <ArrowUpRight className="size-3 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary" />
      </a>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <a
        href={resolveFileUrl(firstFile.file.url)}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex max-w-36 items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-xs text-foreground transition-all hover:border-primary/40 hover:bg-muted/70 hover:text-primary"
        title={`${firstFile.file.originalName} (Nhấn để mở)`}
      >
        <FileText className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        <span className="truncate">{firstFile.file.originalName}</span>
      </a>

      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="inline-flex h-6 items-center gap-0.5 rounded-md border border-border/60 bg-muted/50 px-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer shrink-0"
              title={`Xem thêm ${extraCount} tài liệu khác`}
            >
              <span>+{extraCount}</span>
              <ChevronDown className="size-3 opacity-60" />
            </button>
          }
        />
        <PopoverContent
          align="start"
          className="w-80 gap-0 overflow-hidden border border-border/80 p-0 shadow-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/25 px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <FileText className="size-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                Bản vẽ & tài liệu
              </span>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {files.length} file
            </span>
          </div>

          {/* Danh sách file đính kèm */}
          <div className="max-h-52 space-y-0.5 overflow-y-auto p-1.5">
            {files.map((itemFile) => (
              <a
                key={itemFile.id}
                href={resolveFileUrl(itemFile.file.url)}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/70"
                title={itemFile.file.originalName}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground transition-colors group-hover:text-primary">
                      {itemFile.file.originalName}
                    </p>
                    {itemFile.file.size ? (
                      <p className="text-[10px] text-muted-foreground">
                        {prettyBytes(itemFile.file.size)}
                      </p>
                    ) : null}
                  </div>
                </div>
                <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary" />
              </a>
            ))}
          </div>

          {/* Link chuyển sang xem chi tiết sản phẩm */}
          <div className="border-t border-border/50 bg-muted/20 p-2">
            <LinkButton
              to="/manage/products/$productId"
              params={{ productId: item.id }}
              search={{ tab: "info" }}
              className="w-full "
            >
              <span>Xem chi tiết sản phẩm</span>
              <ArrowUpRight className="size-3.5" />
            </LinkButton>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
