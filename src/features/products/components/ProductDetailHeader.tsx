import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { Loader2 } from "lucide-react"
import {
  AltArrowLeft,
  Box,
  Diskette,
  Printer,
  TrashBinTrash,
} from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { DeleteProductDialog } from "@/features/products/components/DeleteProductDialog"
import { ProductStatusBadge } from "@/features/products/components/ProductBadges"
import { ProductDetailTabs } from "@/features/products/components/ProductDetailTabs"
import { resolveFileUrl } from "@/lib/file-url"
import type { ProductDetailTab } from "@/features/products/schemas/product-detail-search.schema"
import type { Item } from "@/lib/types/item.type"
import type { FileResource } from "@/lib/types/file.type"

type ProductDetailHeaderProps = {
  product: Item
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
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách sản phẩm"
            asChild
          >
            <Link to="/manage/products" search={{ page: 1, limit: 10 }}>
              <AltArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
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
              <span>ĐVT: {product.unit.name}</span>
              {product.clonedFrom ? (
                <>
                  <Dot />
                  <span>
                    Sao chép từ{" "}
                    <Link
                      to="/manage/products/$productId"
                      params={{ productId: product.clonedFrom.id }}
                      search={{ tab: "info" }}
                      className="font-mono font-medium text-primary hover:underline"
                    >
                      {product.clonedFrom.code}
                    </Link>
                  </span>
                </>
              ) : null}
              <Dot />
              <span>
                Cập nhật{" "}
                {DateTime.fromISO(product.updatedAt).toFormat("dd/MM/yyyy")}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ProductStatusBadge status={product.status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Only the info tab buffers edits in a form. The structure and BOM tabs
              write on each action, so a shared "Lưu" there would either do nothing
              or silently submit a different tab's data. */}
          {activeTab === "info" ? (
            <PermissionGate permission="items:update">
              <Button type="button" disabled={isSaving} onClick={onSave}>
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Đang lưu
                  </>
                ) : (
                  <>
                    <Diskette className="size-4" />
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

          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
          >
            <Printer className="size-4" />
            In
          </Button>

          <PermissionGate permission="items:delete">
            <DeleteProductDialog
              product={product}
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                >
                  <TrashBinTrash className="size-4" />
                  Xóa
                </Button>
              }
            />
          </PermissionGate>
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

function ProductHeaderThumbnail({ image, name }: ProductHeaderThumbnailProps) {
  // File đã upload nhưng bị dọn (orphan sweep/xoá) sẽ 404 khi hiển thị lại — bắt qua `onError` để
  // rơi về đúng fallback "chưa có ảnh" thay vì ảnh vỡ trần trụi. Reset ngay trong lúc render khi
  // đổi sản phẩm — "adjusting state when a prop changes" theo khuyến nghị của React, không dùng
  // effect vì compiler chặn setState đồng bộ trong effect.
  const [isBroken, setIsBroken] = useState(false)
  const [prevImageId, setPrevImageId] = useState(image?.id)
  if (image?.id !== prevImageId) {
    setPrevImageId(image?.id)
    setIsBroken(false)
  }

  if (!image || isBroken) {
    return (
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Box className="size-5" />
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
