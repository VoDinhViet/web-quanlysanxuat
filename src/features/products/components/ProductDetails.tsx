import { DateTime } from "luxon"
import { Info } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ProductStatusBadge } from "@/features/products/components/ProductBadges"
import { PRODUCT_STATUS_LABELS } from "@/features/products/types/product.type"
import type { Product } from "@/features/products/types/product.type"
import { cn } from "@/lib/utils"

// List rows and the detail endpoint eager-load the same relations, so the row
// already carries everything shown here — no lazy detail fetch needed.
export function ProductDetails({
  product,
  trigger,
}: {
  product: Product
  trigger: ReactNode
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="gap-0 overflow-y-auto p-0 data-[side=right]:w-full sm:max-w-lg"
      >
        <SheetHeader className="space-y-0 border-b border-border bg-gradient-to-b from-muted/50 to-transparent px-4 py-5">
          <SheetTitle className="sr-only">Chi tiết sản phẩm</SheetTitle>
          <SheetDescription className="sr-only">
            {product.code} · {product.name}
          </SheetDescription>

          <div className="flex items-start gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="size-full object-cover"
                />
              ) : (
                <img
                  src="/empty-image.svg"
                  alt=""
                  className="size-full object-contain p-2.5"
                />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
              <h2 className="text-base leading-snug font-semibold text-foreground">
                {product.name}
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                {product.code}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <ProductStatusBadge status={product.status} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <DetailsSection title="Thông tin chung" icon={Info}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <DetailItem label="Mã sản phẩm" value={product.code} />
            <DetailItem label="Tên sản phẩm" value={product.name} />
            <DetailItem
              label="Khách hàng"
              value={product.client?.name ?? "—"}
            />
            <DetailItem
              label="Nhóm sản phẩm"
              value={product.group?.name ?? "—"}
            />
            <DetailItem label="Rev" value={product.revision} />
            <DetailItem label="Đơn vị tính" value={product.unit.name} />
            <DetailItem
              label="Trạng thái"
              value={PRODUCT_STATUS_LABELS[product.status]}
            />
            <DetailItem
              label="Người tạo"
              value={product.creator?.username ?? "—"}
            />
            <DetailItem
              label="Ngày tạo"
              value={DateTime.fromISO(product.createdAt).toFormat("dd/MM/yyyy")}
            />
            <DetailItem
              label="Cập nhật"
              value={DateTime.fromISO(product.updatedAt).toFormat("dd/MM/yyyy")}
            />
          </div>
          <DetailItem
            className="mt-4"
            label="Ghi chú"
            value={product.note ?? "—"}
          />
        </DetailsSection>
      </SheetContent>
    </Sheet>
  )
}

function DetailsSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <section className="px-4 py-5">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground uppercase">
        <Icon className="size-4 text-muted-foreground" />
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
