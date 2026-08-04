import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import {
  Box,
  Buildings2,
  CalendarAdd,
  ClockCircle,
  Copy,
  Gallery,
  GalleryRemove,
  InfoCircle,
  Layers,
  MagniferZoomIn,
  Notes,
  RecordCircle,
  Ruler,
  User,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import {
  ProductStatusBadge,
  ProductTypeBadge,
} from "@/features/products/components/ProductBadges"
import { resolveFileUrl } from "@/lib/file-url"
import type { Product } from "@/lib/types/product.type"
import type { FileResource } from "@/lib/types/file.type"

type ProductDetailSidebarProps = {
  product: Product
}

// Keeps the product's key facts, image and documents in view while the user
// works in the structure and BOM tabs, where the info form isn't rendered.
export function ProductDetailSidebar({ product }: ProductDetailSidebarProps) {
  return (
    <>
      {/* Code and name aren't repeated — the header already shows them large. */}
      <SidebarSection title="Thông tin sản phẩm" icon={InfoCircle}>
        <dl className="divide-y divide-border">
          <SummaryRow
            icon={Buildings2}
            label="Khách hàng"
            value={product.client?.name ?? "—"}
          />
          <SummaryRow
            icon={Box}
            label="Nhóm sản phẩm"
            value={product.group?.name ?? "—"}
          />
          <SummaryRow
            icon={Ruler}
            label="Đơn vị tính"
            value={product.unit.name}
          />
          {product.source ? (
            <SummaryRow
              icon={Copy}
              label="Sao chép từ"
              value={
                <Link
                  to="/manage/products/$productId"
                  params={{ productId: product.source.id }}
                  search={{ tab: "info" }}
                  className="font-mono text-primary hover:underline"
                >
                  {product.source.code}
                </Link>
              }
            />
          ) : null}
          <SummaryRow
            icon={Layers}
            label="Loại sản phẩm"
            value={<ProductTypeBadge type={product.type} />}
          />
          <SummaryRow
            icon={RecordCircle}
            label="Trạng thái"
            value={<ProductStatusBadge status={product.status} />}
          />
          <SummaryRow
            icon={User}
            label="Người tạo"
            value={product.creator?.username ?? "—"}
          />
          <SummaryRow
            icon={CalendarAdd}
            label="Ngày tạo"
            value={DateTime.fromISO(product.createdAt).toFormat("dd/MM/yyyy")}
          />
          <SummaryRow
            icon={ClockCircle}
            label="Ngày cập nhật"
            value={DateTime.fromISO(product.updatedAt).toFormat("dd/MM/yyyy")}
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
            {product.note || "Chưa có ghi chú"}
          </p>
        </div>
      </SidebarSection>

      <SidebarSection title="Hình ảnh sản phẩm" icon={Gallery} padded>
        {/* One image today — `Product.image` is a single file. The multi-image
            gallery in the mockup arrives with its backend in a later phase. */}
        <ProductImagePreview image={product.image} name={product.name} />
      </SidebarSection>
    </>
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
  mono?: boolean
}

function SummaryRow({
  icon: IconComponent,
  label,
  value,
  mono,
}: SummaryRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] items-center gap-3 px-4 py-2.5">
      <dt className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <IconComponent className="size-3.5 shrink-0" />
        {label}
      </dt>
      <dd
        className={
          mono
            ? "font-mono text-xs font-medium break-words text-foreground"
            : "text-xs font-medium break-words text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  )
}

type ProductImagePreviewProps = {
  image: FileResource | null
  name: string
}

// The signed URL expires after about an hour, so a tab left open long enough
// gets a 401 on the image. There is no status code on an <img> error event, so
// a retry couldn't tell "expired" from "deleted" — fall back to the empty state
// instead. The next refetch of the product mints a fresh link.
function ProductImagePreview({ image, name }: ProductImagePreviewProps) {
  const [isBroken, setIsBroken] = useState(false)

  if (!image || isBroken) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 text-center">
        <GalleryRemove className="size-7 text-muted-foreground/40" />
        <p className="text-[11px] font-medium text-muted-foreground">
          {isBroken ? "Không tải được hình ảnh" : "Chưa có hình ảnh"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Opens the signed URL directly — the route is @Public() so the full-size
          image loads in a new tab without an auth header. */}
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
          onError={() => setIsBroken(true)}
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
