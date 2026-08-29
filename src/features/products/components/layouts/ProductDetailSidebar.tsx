import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import {
  Buildings2,
  CalendarAdd,
  ClockCircle,
  Copy,
  Documents,
  FileText,
  Gallery,
  InfoCircle,
  Layers,
  MagniferZoomIn,
  Notes,
  Paperclip,
  RecordCircle,
  Ruler,
  User,
} from "@solar-icons/react"
import prettyBytes from "pretty-bytes"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import {
  ProductStatusBadge,
  ProductTypeBadge,
} from "@/features/products/components/primitives/ProductBadges"
import { resolveFileUrl } from "@/lib/file-url"
import type { Item, ItemFile } from "@/lib/types/item.type"
import type { FileResource } from "@/lib/types/file.type"

type ProductDetailSidebarProps = {
  product: Item
}

// Keeps the product's key facts, image and documents in view while the user
// works in the materials tab, where the info form isn't rendered. The BOM
// tab (ProductDetailPage) hides this column entirely — its table runs wide
// enough to need the full row.
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
            icon={Ruler}
            label="Đơn vị tính"
            value={product.unit.name}
          />
          {product.clonedFrom ? (
            <SummaryRow
              icon={Copy}
              label="Sao chép từ"
              value={
                <Link
                  to="/manage/products/$productId"
                  params={{ productId: product.clonedFrom.id }}
                  search={{ tab: "info" }}
                  className="font-mono text-primary hover:underline"
                >
                  {product.clonedFrom.code}
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
            value={product.creator?.fullName ?? "—"}
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
        {/* One image today — `Item.image` is a single file. The multi-image
            gallery in the mockup arrives with its backend in a later phase. */}
        <ProductImagePreview image={product.image} name={product.name} />
      </SidebarSection>

      <SidebarSection
        title={`Tài liệu đính kèm (${product.files.length})`}
        icon={Paperclip}
        padded
      >
        <ProductDocumentsList files={product.files} />
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

type ProductDocumentsListProps = {
  files: ItemFile[]
}

// Chỉ-đọc — sửa/xoá tài liệu ở tab "Thông tin sản phẩm" (ProductDocumentsField). Không bọc card
// riêng, ngồi thẳng trong `SidebarSection` như mọi khối khác của sidebar.
function ProductDocumentsList({ files }: ProductDocumentsListProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
        <Documents className="size-7 text-muted-foreground/40" />
        <p className="text-[11px] font-medium text-muted-foreground">
          Chưa có tài liệu đính kèm
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-1.5">
      {files.map((itemFile) => (
        <li key={itemFile.id}>
          <a
            href={resolveFileUrl(itemFile.file.url)}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">
              {itemFile.file.originalName}
            </span>
            <span className="shrink-0 text-muted-foreground">
              {prettyBytes(itemFile.file.size)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

type ProductImagePreviewProps = {
  image: FileResource | null
  name: string
}

function ProductImagePreview({ image, name }: ProductImagePreviewProps) {
  // File đã upload nhưng bị dọn (orphan sweep/xoá) sẽ 404 khi hiển thị lại — bắt qua `onError` để
  // rơi về đúng fallback "chưa có hình ảnh" (link "Xem ảnh gốc" cũng vô nghĩa nếu ảnh đã mất).
  // Reset ngay trong lúc render khi đổi sản phẩm — "adjusting state when a prop changes" theo
  // khuyến nghị của React, không dùng effect vì compiler chặn setState đồng bộ trong effect.
  const [isBroken, setIsBroken] = useState(false)
  const [prevImageId, setPrevImageId] = useState(image?.id)
  if (image?.id !== prevImageId) {
    setPrevImageId(image?.id)
    setIsBroken(false)
  }

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
