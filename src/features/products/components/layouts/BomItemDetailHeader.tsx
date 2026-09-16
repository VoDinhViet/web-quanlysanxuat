import { Loader2 } from "lucide-react"
import {
  AltArrowLeft,
  Diskette,
  LayersMinimalistic,
  TrashBinTrash,
} from "@solar-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button, LinkButton } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { BomItemDetailTabs } from "@/features/products/components/layouts/BomItemDetailTabs"
import { useBrokenImage } from "@/features/products/hooks/use-broken-image"
import { resolveFileUrl } from "@/lib/file-url"
import { bomItemTypeLabels } from "@/lib/types/bom-item.type"
import type { BomItemDetailTab } from "@/features/products/schemas/bom-item-detail-search.schema"
import type { BomItem, BomItemType } from "@/lib/types/bom-item.type"
import type { FileResource } from "@/lib/types/file.type"
import type { Item } from "@/lib/types/item.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Tint recipe mirrors ProductOperationsPanel's OperationTypeBadge: shadcn Badge
// (variant="outline") + a bg-<token>/15 text-<token> tint per node type.
const bomItemTypeStyles: Record<BomItemType, string> = {
  ROOT: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  COMPONENT: "bg-primary/15 text-primary",
  CONSUMABLE: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
}

type BomItemDetailHeaderProps = {
  product: Item
  bomItem: BomItem
  activeTab: BomItemDetailTab
  isSaving: boolean
  onSave: () => void
  onRequestDelete: (bomItem: BomItem) => void
  lockedTabs?: BomItemDetailTab[]
  lockedHint?: string
}

// Identity, the facts the form doesn't edit, and the tab strip read as one unit,
// so they share a single card instead of floating as three separate blocks —
// same shape as ProductDetailHeader.
export function BomItemDetailHeader({
  product,
  bomItem,
  activeTab,
  isSaving,
  onSave,
  onRequestDelete,
  lockedTabs,
  lockedHint,
}: BomItemDetailHeaderProps) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 print:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <LinkButton
            to="/manage/products/$productId"
            params={{ productId: product.id }}
            search={{ tab: "boms" }}
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại cấu trúc sản phẩm"
          >
            <AltArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </LinkButton>

          <BomItemHeaderThumbnail image={bomItem.image} name={bomItem.name} />

          <div className="min-w-0">
            <h2 className="min-w-0 truncate text-base leading-snug font-semibold text-foreground sm:text-lg">
              {bomItem.name}
            </h2>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="font-mono font-medium text-foreground">
                {bomItem.revision
                  ? `${bomItem.code} · ${bomItem.revision}`
                  : bomItem.code}
              </span>
              <Dot />
              <span>Cấp {bomItem.level}</span>
              <Dot />
              <span>ĐVT: {bomItem.unit?.name ?? "—"}</span>
              {bomItem.type !== "ROOT" && (
                <>
                  <Dot />
                  <span>SL: {quantityFormatter.format(bomItem.quantity)}</span>
                </>
              )}
              <Dot />
              <span>
                Sản phẩm:{" "}
                <span className="font-mono font-medium text-foreground">
                  {product.code} · {product.revision}
                </span>
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge
              variant="outline"
              className={bomItemTypeStyles[bomItem.type]}
            >
              {bomItemTypeLabels[bomItem.type]}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Only the info tab buffers edits in a form. The consumables and
              operations tabs write on each action, so a shared "Lưu" there would
              either do nothing or silently submit a different tab's data. */}
          {activeTab === "info" ? (
            <PermissionGate permission="items:bom-manage">
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

          {/* ROOT is the product itself — it goes away with the product, never on its own. */}
          {bomItem.type !== "ROOT" && (
            <PermissionGate permission="items:bom-manage">
              <Button
                type="button"
                variant="outline"
                className="border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onRequestDelete(bomItem)}
              >
                <TrashBinTrash className="size-4" />
                Xóa
              </Button>
            </PermissionGate>
          )}
        </div>
      </div>

      <BomItemDetailTabs lockedTabs={lockedTabs} lockedHint={lockedHint} />
    </>
  )
}

// A dot separator between the inline meta facts.
function Dot() {
  return <span className="text-border">•</span>
}

type BomItemHeaderThumbnailProps = {
  image: FileResource | null
  name: string
}

function BomItemHeaderThumbnail({ image, name }: BomItemHeaderThumbnailProps) {
  const [isBroken, markBroken] = useBrokenImage(image?.id)

  if (!image || isBroken) {
    return (
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <LayersMinimalistic className="size-5" />
      </div>
    )
  }

  return (
    <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30">
      <img
        src={resolveFileUrl(image.url)}
        alt={name}
        className="size-full object-cover"
        onError={markBroken}
      />
    </div>
  )
}
