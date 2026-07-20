import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { Loader2 } from "lucide-react"
import { Icon } from "@iconify/react"
import altArrowLeftBold from "@iconify-icons/solar/alt-arrow-left-bold"
import boxBold from "@iconify-icons/solar/box-bold"
import branchingPathsUpBold from "@iconify-icons/solar/branching-paths-up-bold"
import disketteBold from "@iconify-icons/solar/diskette-bold"
import printerBold from "@iconify-icons/solar/printer-bold"

import { Button } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { ProductStatusBadge } from "@/features/products/components/ProductBadges"
import { ProductDetailTabs } from "@/features/products/components/ProductDetailTabs"
import { resolveFileUrl } from "@/lib/file-url"
import type { ProductDetailTab } from "@/features/products/schemas/product-detail-search.schema"
import type { Product } from "@/features/products/types/product.type"
import type { FileResource } from "@/lib/types/file.type"

type ProductDetailHeaderProps = {
  product: Product
  activeTab: ProductDetailTab
  isSaving: boolean
  onSave: () => void
}

// Identity, the facts the form doesn't edit, and the tab strip read as one unit,
// so they share a single card instead of floating as three separate blocks.
export function ProductDetailHeader({
  product,
  activeTab,
  isSaving,
  onSave,
}: ProductDetailHeaderProps) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 print:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="bg-background text-foreground"
            aria-label="Quay lại danh sách sản phẩm"
            asChild
          >
            <Link to="/manage/products" search={{ page: 1, limit: 10 }}>
              <Icon icon={altArrowLeftBold} className="size-4" />
            </Link>
          </Button>

          <ProductHeaderThumbnail image={product.image} name={product.name} />

          <div className="min-w-0">
            <h2 className="min-w-0 truncate text-base leading-snug font-semibold text-foreground sm:text-lg">
              {product.name}
            </h2>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="font-mono font-medium text-foreground">
                {product.code}
              </span>
              <Dot />
              <span>{product.group?.name ?? "Chưa phân nhóm"}</span>
              <Dot />
              <span>ĐVT: {product.unit.name}</span>
              <Dot />
              <span>
                Cập nhật{" "}
                {DateTime.fromISO(product.updatedAt).toFormat("dd/MM/yyyy")}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ProductStatusBadge status={product.status} />
            {product.revision ? (
              <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[11px] font-medium whitespace-nowrap text-muted-foreground ring-1 ring-border ring-inset">
                {product.revision}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Only the info tab buffers edits in a form. The structure and BOM tabs
              write on each action, so a shared "Lưu" there would either do nothing
              or silently submit a different tab's data. */}
          {activeTab === "info" ? (
            <PermissionGate permission="products:update">
              <Button type="button" disabled={isSaving} onClick={onSave}>
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Đang lưu
                  </>
                ) : (
                  <>
                    <Icon icon={disketteBold} className="size-4" />
                    Lưu
                  </>
                )}
              </Button>
            </PermissionGate>
          ) : (
            <p className="text-xs font-medium text-muted-foreground">
              Thay đổi ở tab này được lưu ngay
            </p>
          )}

          <Button type="button" variant="outline" disabled>
            <Icon icon={branchingPathsUpBold} className="size-4" />
            Tạo revision mới
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
          >
            <Icon icon={printerBold} className="size-4" />
            In
          </Button>
        </div>
      </div>

      <ProductDetailTabs />
    </>
  )
}

// A dot separator between the inline meta facts.
function Dot() {
  return <span className="text-border">•</span>
}

type ProductHeaderThumbnailProps = {
  image: FileResource | null
  name: string
}

// The signed URL expires after about an hour, so a tab left open long enough
// gets a 401 on the image. There is no status code on an <img> error event, so
// a retry couldn't tell "expired" from "deleted" — fall back to the icon tile
// instead. The next refetch of the product mints a fresh link.
function ProductHeaderThumbnail({ image, name }: ProductHeaderThumbnailProps) {
  const [isBroken, setIsBroken] = useState(false)

  if (!image || isBroken) {
    return (
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon icon={boxBold} className="size-5" />
      </div>
    )
  }

  return (
    <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30">
      <img
        src={resolveFileUrl(image.url)}
        alt={name}
        className="size-full object-cover"
        onError={() => setIsBroken(true)}
      />
    </div>
  )
}
