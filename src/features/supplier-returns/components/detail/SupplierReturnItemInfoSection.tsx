import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ImageOff, Package } from "lucide-react"
import type { ReactNode } from "react"

import { itemQueryOptions } from "@/features/products/api"
import { SupplierReturnDetailSectionCard } from "@/features/supplier-returns/components/detail/SupplierReturnDetailSectionCard"
import { resolveFileUrl } from "@/lib/file-url"
import type { SupplierReturnDetail } from "@/lib/types/supplier-return.type"
import type { FileResource } from "@/lib/types/file.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type SupplierReturnItemInfoSectionProps = {
  detail: SupplierReturnDetail
}

// Everything except the image comes off `detail.item` — already in the phiếu trả response, no
// extra wait. The image is `GET /api/items/:id`-only, so it (and only it) depends on
// itemQueryOptions, prefetched by the route loader alongside supplierQueryOptions.
export function SupplierReturnItemInfoSection({
  detail,
}: SupplierReturnItemInfoSectionProps) {
  const { data: item } = useSuspenseQuery(itemQueryOptions(detail.item.id))

  return (
    <SupplierReturnDetailSectionCard
      icon={Package}
      title="Thông tin vật tư trả"
      contentClassName="sm:flex sm:gap-5"
    >
      <div className="mb-4 w-28 shrink-0 sm:mb-0">
        <ItemImagePreview image={item.image} name={detail.item.name} />
      </div>

      <dl className="grid flex-1 grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <InfoField
          label="Mã vật tư"
          value={<span className="font-mono">{detail.item.code}</span>}
        />
        <InfoField label="Tên vật tư" value={detail.item.name} />
        <InfoField label="ĐVT" value={detail.item.unit.name} />
        <InfoField
          label="SL trả"
          value={quantityFormatter.format(detail.quantity)}
        />
        <InfoField
          label="Ghi chú vật tư"
          value={detail.note ?? "—"}
          className="sm:col-span-2"
        />
      </dl>
    </SupplierReturnDetailSectionCard>
  )
}

type InfoFieldProps = {
  label: string
  value: ReactNode
  className?: string
}

function InfoField({ label, value, className }: InfoFieldProps) {
  return (
    <div className={className}>
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium break-words text-foreground">
        {value}
      </dd>
    </div>
  )
}

type ItemImagePreviewProps = {
  image: FileResource | null
  name: string
}

// Same signed-URL-expires fallback idiom as ProductDetailSidebar's ProductImagePreview — a tab
// left open past the ~1h signature window falls back to the empty state instead of a broken
// <img>, since an error event carries no status code to tell "expired" from "deleted".
function ItemImagePreview({ image, name }: ItemImagePreviewProps) {
  const [isBroken, setIsBroken] = useState(false)

  if (!image || isBroken) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-muted/30 text-center">
        <ImageOff className="size-6 text-muted-foreground/40" />
        <p className="text-[10px] font-medium text-muted-foreground">
          {isBroken ? "Không tải được ảnh" : "Chưa có ảnh"}
        </p>
      </div>
    )
  }

  return (
    <a
      href={resolveFileUrl(image.url)}
      target="_blank"
      rel="noreferrer"
      className="block aspect-square overflow-hidden rounded-md border border-border bg-muted/30"
    >
      <img
        src={resolveFileUrl(image.url)}
        alt={name}
        className="size-full object-cover"
        onError={() => setIsBroken(true)}
      />
    </a>
  )
}
