import { Package } from "lucide-react"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { PRODUCT_STATUS_LABELS } from "@/features/products/types/product.type"
import type { Product } from "@/features/products/types/product.type"
import { cn } from "@/lib/utils"

export function ProductDetails({
  product,
  trigger,
}: {
  product: Product
  trigger: ReactNode
}) {
  const createdAt = new Date(product.createdAt).toLocaleDateString("vi-VN")

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="gap-0 overflow-y-auto p-0 data-[side=right]:w-full sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle>Chi tiết sản phẩm</SheetTitle>
          <SheetDescription>{product.name}</SheetDescription>
        </SheetHeader>

        <div className="border-b border-border px-4 py-5">
          <div className="flex items-start gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="size-full rounded-md object-cover"
                />
              ) : (
                <Package className="size-8 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="truncate text-base font-semibold text-foreground">
                  {product.name}
                </h2>
                <Badge
                  variant="outline"
                  className={cn(
                    "h-5 border-transparent px-2 text-[10px] font-medium",
                    product.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  )}
                >
                  {PRODUCT_STATUS_LABELS[product.status]}
                </Badge>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {product.code}
              </p>
            </div>
          </div>
        </div>

        <DetailsSection title="Thông tin chung">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <DetailItem label="Mã sản phẩm" value={product.code} />
            <DetailItem label="Tên sản phẩm" value={product.name} />
            <DetailItem
              label="Khách hàng"
              value={product.customerName ?? "—"}
            />
            <DetailItem
              label="Nhóm sản phẩm"
              value={product.productGroupName ?? "—"}
            />
            <DetailItem label="Rev" value={product.revision} />
            <DetailItem label="ĐVT" value={product.unit} />
            <DetailItem label="Người tạo" value={product.createdByName} />
            <DetailItem label="Ngày tạo" value={createdAt} />
          </div>
        </DetailsSection>
      </SheetContent>
    </Sheet>
  )
}

function DetailsSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="border-b border-border px-4 py-4 last:border-b-0">
      <h3 className="mb-4 text-xs font-semibold tracking-wide text-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  )
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="text-xs font-medium break-words text-foreground">{value}</p>
    </div>
  )
}
