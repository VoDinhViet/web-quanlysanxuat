import { useState } from "react"
import { Package, MoreHorizontal, Search, History, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { InventoryProduct } from "@/lib/types/inventory-product.type"
import { cn } from "@/lib/utils"

const numberFmt = new Intl.NumberFormat("vi-VN")

export function ProductImageCell({ product }: { product: InventoryProduct }) {
  return (
    <div className="flex size-9 items-center justify-center rounded-md border border-border bg-muted/40">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="size-8 rounded object-cover"
        />
      ) : (
        <Package className="size-5 text-muted-foreground/70" />
      )}
    </div>
  )
}

export function QuantityCell({
  value,
  variant = "neutral",
}: {
  value: number
  variant?: "blue" | "orange" | "green" | "available" | "neutral"
}) {
  let colorClass = "text-foreground font-medium"

  if (variant === "blue") {
    colorClass = "text-blue-600 dark:text-blue-400 font-semibold"
  } else if (variant === "orange") {
    colorClass = "text-amber-600 dark:text-amber-400 font-semibold"
  } else if (variant === "green") {
    colorClass = "text-emerald-600 dark:text-emerald-400 font-semibold"
  } else if (variant === "available") {
    colorClass =
      value < 0
        ? "text-rose-600 dark:text-rose-400 font-bold"
        : "text-foreground font-semibold"
  }

  return <span className={cn("tabular-nums text-xs", colorClass)}>{numberFmt.format(value)}</span>
}

export function InventoryProductActionsCell({
  product,
}: {
  product: InventoryProduct
}) {
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-7 text-primary border-primary/30 hover:bg-primary/10"
          title="Xem nhanh thành phẩm"
          onClick={() => setDetailOpen(true)}
        >
          <Search className="size-3.5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground"
              aria-label="Thao tác"
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetailOpen(true)}>
              <FileText className="mr-2 size-4" />
              Thẻ kho thành phẩm
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDetailOpen(true)}>
              <History className="mr-2 size-4" />
              Lịch sử nhập / xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Quick View Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono">
              <Package className="size-5 text-primary" />
              {product.code} - {product.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-xs pt-2">
            <div className="flex justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Khách hàng:</span>
              <span className="font-semibold text-foreground">{product.clientName}</span>
            </div>
            <div className="flex justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Đơn vị tính:</span>
              <span className="font-semibold text-foreground">{product.unit}</span>
            </div>
            <div className="flex justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Tổng nhu cầu PO:</span>
              <span className="font-semibold text-blue-600">{numberFmt.format(product.poDemandQuantity)}</span>
            </div>
            <div className="flex justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Tồn thực tế (Đã QC):</span>
              <span className="font-semibold text-blue-600">{numberFmt.format(product.actualQuantity)}</span>
            </div>
            <div className="flex justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Đã giữ (DO chưa giao):</span>
              <span className="font-semibold text-amber-600">{numberFmt.format(product.reservedQuantity)}</span>
            </div>
            <div className="flex justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Có thể xuất:</span>
              <span className="font-semibold text-emerald-600">{numberFmt.format(product.exportableQuantity)}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-muted-foreground">Tồn TP khả dụng:</span>
              <span className={cn("font-bold", product.availableQuantity < 0 ? "text-rose-600" : "text-foreground")}>
                {numberFmt.format(product.availableQuantity)}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
