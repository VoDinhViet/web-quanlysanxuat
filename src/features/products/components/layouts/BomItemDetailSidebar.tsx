import { Link } from "@tanstack/react-router"
import {
  Box,
  ClipboardList,
  Gallery,
  Hashtag,
  InfoCircle,
  Layers,
  LayersMinimalistic,
  MagniferZoomIn,
  Notes,
  Ruler,
  SortVertical,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { useBrokenImage } from "@/features/products/hooks/use-broken-image"
import { resolveFileUrl } from "@/lib/file-url"
import { bomItemTypeLabels } from "@/lib/types/bom-item.type"
import type { BomItem } from "@/lib/types/bom-item.type"
import type { FileResource } from "@/lib/types/file.type"
import type { Item } from "@/lib/types/item.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type BomItemDetailSidebarProps = {
  product: Item
  bomItem: BomItem
  // Cha trực tiếp trong cây (null nghĩa là ngay dưới Cấp 0) — tra sẵn ở page, nơi giữ cả cây.
  parent: BomItem | null
  directsCount: number
  operationsCount: number
}

// Keeps the node's key facts and image in view while the user works in the
// info form. The Vật tư/Công đoạn tabs (BomItemDetailPage) hide this column
// entirely — their tables run wide enough to need the full row.
export function BomItemDetailSidebar({
  product,
  bomItem,
  parent,
  directsCount,
  operationsCount,
}: BomItemDetailSidebarProps) {
  return (
    <>
      {/* Code and name aren't repeated — the header already shows them large. */}
      <SidebarSection title="Thông tin chung" icon={InfoCircle}>
        <dl className="divide-y divide-border">
          <SummaryRow
            icon={Layers}
            label="Loại"
            value={bomItemTypeLabels[bomItem.type]}
          />
          <SummaryRow icon={Hashtag} label="Cấp" value={bomItem.level} />
          <SummaryRow
            icon={Box}
            label="Số lượng"
            value={quantityFormatter.format(bomItem.quantity)}
          />
          <SummaryRow
            icon={SortVertical}
            label="Thứ tự sắp xếp"
            value={bomItem.sortOrder}
          />
          <SummaryRow
            icon={Ruler}
            label="Đơn vị tính"
            value={bomItem.unit?.name ?? "—"}
          />
          <SummaryRow
            icon={LayersMinimalistic}
            label="Hạng mục cha"
            value={<ParentLink product={product} parent={parent} />}
          />
          <SummaryRow icon={Box} label="Vật tư" value={directsCount} />
          <SummaryRow
            icon={ClipboardList}
            label="Công đoạn"
            value={operationsCount}
          />
        </dl>

        {/* A note is free text that would wrap badly in the two-column rows, so
            it gets its own full-width block. */}
        <div className="border-t border-border px-4 py-3">
          <p className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <Notes className="size-3.5 shrink-0" />
            Ghi chú
          </p>
          <p className="mt-1.5 text-xs font-medium break-words text-foreground">
            {bomItem.note || "Chưa có ghi chú"}
          </p>
        </div>
      </SidebarSection>

      <SidebarSection title="Hình ảnh" icon={Gallery} padded>
        {/* `image` is coalesced: the linked item's (DIRECT) or the node's own
            `imageFileId` (COMPONENT, edited on the Thông tin tab). */}
        <BomItemImagePreview image={bomItem.image} name={bomItem.name} />
      </SidebarSection>
    </>
  )
}

type ParentLinkProps = {
  product: Item
  parent: BomItem | null
}

// `parent === null` nghĩa là node nằm ngay dưới Cấp 0 (BomItem.parentId, không phải "chưa tìm
// thấy cha" — mọi node đều có cha, kể cả Cấp 0) — link về tab cấu trúc của sản phẩm thay vì trang
// chi tiết riêng, vì Cấp 0 không có trang chi tiết riêng nữa (docs/decisions/
// level-0-outside-bom-tree-response.md).
function ParentLink({ product, parent }: ParentLinkProps) {
  if (parent === null) {
    return (
      <Link
        to="/manage/products/$productId"
        params={{ productId: product.id }}
        search={{ tab: "boms" }}
        className="font-mono text-primary hover:underline"
      >
        {product.code} · {product.revision}
      </Link>
    )
  }

  return (
    <Link
      to="/manage/products/$productId/bom/$bomItemId"
      params={{ productId: product.id, bomItemId: parent.id }}
      search={{ tab: "info" }}
      className="font-mono text-primary hover:underline"
    >
      {parent.code}
    </Link>
  )
}

type SidebarSectionProps = {
  title: string
  icon: ComponentType<IconProps>
  children: ReactNode
  // The summary list draws its own row padding; other sections need the box.
  padded?: boolean
}

function SidebarSection({
  title,
  icon: IconComponent,
  children,
  padded,
}: SidebarSectionProps) {
  return (
    // One panel, blocks separated by a rule — `not-first` keeps the top edge
    // clean so the divider only ever falls between two sections.
    <div className="not-first:border-t not-first:border-border">
      <h2 className="flex items-center gap-2 border-b border-border px-4 py-3.5 text-xs font-semibold tracking-wide text-foreground uppercase">
        <IconComponent className="size-4 text-muted-foreground" />
        {title}
      </h2>
      <div className={padded ? "p-4" : "py-1"}>{children}</div>
    </div>
  )
}

type SummaryRowProps = {
  icon: ComponentType<IconProps>
  label: string
  value: ReactNode
}

function SummaryRow({ icon: IconComponent, label, value }: SummaryRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] items-center gap-3 px-4 py-2.5">
      <dt className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <IconComponent className="size-3.5 shrink-0" />
        {label}
      </dt>
      <dd className="text-xs font-medium break-words text-foreground">
        {value}
      </dd>
    </div>
  )
}

type BomItemImagePreviewProps = {
  image: FileResource | null
  name: string
}

function BomItemImagePreview({ image, name }: BomItemImagePreviewProps) {
  // "Xem ảnh gốc" cũng vô nghĩa nếu ảnh đã mất — isBroken gộp luôn vào điều kiện rơi về fallback
  // bên dưới.
  const [isBroken, markBroken] = useBrokenImage(image?.id)

  if (!image || isBroken) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 text-center">
        <Gallery className="size-7 text-muted-foreground/40" />
        <p className="text-[11px] font-medium text-muted-foreground">
          Chưa có hình ảnh
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* URL public vĩnh viễn — ảnh gốc mở thẳng ở tab mới, không cần auth header. */}
      <a
        href={resolveFileUrl(image.url)}
        target="_blank"
        rel="noreferrer"
        className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img
          src={resolveFileUrl(image.url)}
          alt={name}
          className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
          onError={markBroken}
        />

        <span className="absolute inset-0 flex items-center justify-center bg-foreground/45 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm">
            <MagniferZoomIn className="size-3.5" />
            Xem ảnh gốc
          </span>
        </span>
      </a>

      <p className="truncate text-[11px] text-muted-foreground">
        {image.originalName}
      </p>
    </div>
  )
}
