import { useState } from "react"
import { DateTime } from "luxon"
import { Icon } from "@iconify/react"
import boxBold from "@iconify-icons/solar/box-bold"
import branchingPathsUpBold from "@iconify-icons/solar/branching-paths-up-bold"
import buildings2Bold from "@iconify-icons/solar/buildings-2-bold"
import calendarAddBold from "@iconify-icons/solar/calendar-add-bold"
import clockCircleBold from "@iconify-icons/solar/clock-circle-bold"
import documentsBold from "@iconify-icons/solar/documents-bold"
import fileTextBold from "@iconify-icons/solar/file-text-bold"
import galleryBold from "@iconify-icons/solar/gallery-bold"
import galleryRemoveBold from "@iconify-icons/solar/gallery-remove-bold"
import magniferZoomInBold from "@iconify-icons/solar/magnifer-zoom-in-bold"
import infoCircleBold from "@iconify-icons/solar/info-circle-bold"
import notesBold from "@iconify-icons/solar/notes-bold"
import paperclipBold from "@iconify-icons/solar/paperclip-bold"
import recordCircleBold from "@iconify-icons/solar/record-circle-bold"
import rulerBold from "@iconify-icons/solar/ruler-bold"
import userBold from "@iconify-icons/solar/user-bold"
import type { IconifyIcon } from "@iconify/types"
import type { ReactNode } from "react"

import { ProductStatusBadge } from "@/features/products/components/ProductBadges"
import { ProductRevisionBadge } from "@/features/products/components/ProductRevisionBadge"
import { resolveFileUrl } from "@/lib/file-url"
import type { ProductRevision } from "@/features/products/types/product-revision.type"
import type { Product } from "@/features/products/types/product.type"
import type { FileResource } from "@/lib/types/file.type"

type ProductDetailSidebarProps = {
  product: Product
  activeRevision: ProductRevision
}

// Keeps the product's key facts, image and documents in view while the user
// works in the structure and BOM tabs, where the info form isn't rendered.
export function ProductDetailSidebar({
  product,
  activeRevision,
}: ProductDetailSidebarProps) {
  return (
    <>
      {/* Code and name aren't repeated — the header already shows them large. */}
      <SidebarSection title="Thông tin sản phẩm" icon={infoCircleBold}>
        <dl className="divide-y divide-border">
          <SummaryRow
            icon={buildings2Bold}
            label="Khách hàng"
            value={product.client?.name ?? "—"}
          />
          <SummaryRow
            icon={boxBold}
            label="Nhóm sản phẩm"
            value={product.group?.name ?? "—"}
          />
          <SummaryRow
            icon={rulerBold}
            label="Đơn vị tính"
            value={product.unit.name}
          />
          <SummaryRow
            icon={branchingPathsUpBold}
            label="Revision"
            value={
              <span className="flex items-center gap-2">
                <span className="font-mono">{activeRevision.revisionNo}</span>
                <ProductRevisionBadge isActive={activeRevision.isActive} />
              </span>
            }
          />
          <SummaryRow
            icon={recordCircleBold}
            label="Trạng thái"
            value={<ProductStatusBadge status={product.status} />}
          />
          <SummaryRow
            icon={userBold}
            label="Người tạo"
            value={product.creator?.username ?? "—"}
          />
          <SummaryRow
            icon={calendarAddBold}
            label="Ngày tạo"
            value={DateTime.fromISO(product.createdAt).toFormat("dd/MM/yyyy")}
          />
          <SummaryRow
            icon={clockCircleBold}
            label="Ngày cập nhật"
            value={DateTime.fromISO(product.updatedAt).toFormat("dd/MM/yyyy")}
          />
        </dl>

        {/* A note is free text that would wrap badly in the two-column rows, so
            it gets its own full-width block. */}
        <div className="border-t border-border px-4 py-3">
          <p className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <Icon icon={notesBold} className="size-3.5 shrink-0" />
            Ghi chú
          </p>
          <p className="mt-1.5 text-xs font-medium break-words text-foreground">
            {product.note || "Chưa có ghi chú"}
          </p>
        </div>
      </SidebarSection>

      <SidebarSection title="Hình ảnh sản phẩm" icon={galleryBold} padded>
        {/* One image today — `Product.image` is a single file. The multi-image
            gallery in the mockup arrives with its backend in a later phase. */}
        <ProductImagePreview image={product.image} name={product.name} />
      </SidebarSection>

      <SidebarSection title="Tài liệu đính kèm" icon={paperclipBold} padded>
        {product.attachments.length > 0 ? (
          <ul className="space-y-1.5">
            {product.attachments.map((attachment) => (
              <li key={attachment.id}>
                {/* The download route is @Public(), so the signed URL opens in a
                    new tab without an auth header. */}
                <a
                  href={resolveFileUrl(attachment.file.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  <Icon
                    icon={fileTextBold}
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <span className="truncate">
                    {attachment.file.originalName}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
            <Icon
              icon={documentsBold}
              className="size-7 text-muted-foreground/40"
            />
            <p className="text-[11px] font-medium text-muted-foreground">
              Chưa có tài liệu đính kèm
            </p>
          </div>
        )}
      </SidebarSection>
    </>
  )
}

type SidebarSectionProps = {
  title: string
  icon: IconifyIcon
  children: ReactNode
  // The summary list draws its own row padding; other sections need the box.
  padded?: boolean
}

function SidebarSection({
  title,
  icon,
  children,
  padded,
}: SidebarSectionProps) {
  return (
    // One panel, blocks separated by a rule — `not-first` keeps the top edge
    // clean so the divider only ever falls between two sections.
    <div className="not-first:border-t not-first:border-border">
      <h2 className="flex items-center gap-2 border-b border-border px-4 py-3.5 text-xs font-semibold tracking-wide text-foreground uppercase">
        <Icon icon={icon} className="size-4 text-muted-foreground" />
        {title}
      </h2>
      <div className={padded ? "p-4" : "py-1"}>{children}</div>
    </div>
  )
}

type SummaryRowProps = {
  icon: IconifyIcon
  label: string
  value: ReactNode
  mono?: boolean
}

function SummaryRow({ icon, label, value, mono }: SummaryRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] items-center gap-3 px-4 py-2.5">
      <dt className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <Icon icon={icon} className="size-3.5 shrink-0" />
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
      <div className="flex aspect-4/3 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 text-center">
        <Icon
          icon={galleryRemoveBold}
          className="size-7 text-muted-foreground/40"
        />
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
        className="group relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img
          src={resolveFileUrl(image.url)}
          alt={name}
          className="size-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
          onError={() => setIsBroken(true)}
        />

        <span className="absolute inset-0 flex items-center justify-center bg-foreground/45 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm">
            <Icon icon={magniferZoomInBold} className="size-3.5" />
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
