import { Link } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Eye, GalleryRemove } from "@solar-icons/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { itemQueryOptions } from "@/features/products/api"
import { resolveFileUrl } from "@/lib/file-url"
import type { OqcDetail } from "@/lib/types/oqc.type"
import type { FileResource } from "@/lib/types/file.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type OqcFinishedGoodStripProps = {
  oqc: OqcDetail
}

// Dải thành phẩm nổi bật đầu §1 Lô kiểm tra — cùng khuôn IqcMaterialStrip.tsx. Nhãn/mã đọc từ
// `oqc.bomItem` (snapshot BOM của Job, cùng nguồn cột bảng danh sách OQC) chứ không phải `item`
// sống, để chi tiết và danh sách không bao giờ lệch tên; ảnh vẫn cần gọi `GET /api/items/:id`
// (itemQueryOptions, prefetch phụ thuộc ở route loader — xem $oqcId.tsx).
export function OqcFinishedGoodStrip({ oqc }: OqcFinishedGoodStripProps) {
  const { data: item } = useSuspenseQuery(itemQueryOptions(oqc.item.id))

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <ItemImagePreview image={item.image} name={oqc.bomItem.name} />

      <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <InfoField
          label="Mã thành phẩm"
          value={
            <span className="font-mono text-primary">{oqc.bomItem.code}</span>
          }
        />
        <InfoField label="Tên thành phẩm" value={oqc.bomItem.name} />
        <InfoField label="Đơn vị" value={oqc.unit.name} />
        <InfoField
          label="Lot size"
          value={
            <span className="font-mono text-primary tabular-nums">
              {quantityFormatter.format(oqc.quantity)}
            </span>
          }
        />
      </dl>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Xem thành phẩm"
        className="self-start text-muted-foreground sm:self-center"
        asChild
      >
        <Link
          to="/manage/products/$productId"
          params={{ productId: oqc.item.id }}
          search={{ tab: "info" }}
        >
          <Eye className="size-4" />
        </Link>
      </Button>
    </div>
  )
}

type InfoFieldProps = {
  label: string
  value: ReactNode
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-semibold text-foreground">
        {value}
      </dd>
    </div>
  )
}

type ItemImagePreviewProps = {
  image: FileResource | null
  name: string
}

function ItemImagePreview({ image, name }: ItemImagePreviewProps) {
  if (!image) {
    return (
      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
        <GalleryRemove className="size-5 text-muted-foreground/40" />
      </div>
    )
  }

  const imageUrl = resolveFileUrl(image.url)

  return (
    <a
      href={imageUrl}
      target="_blank"
      rel="noreferrer"
      className="block size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30"
    >
      <img src={imageUrl} alt={name} className="size-full object-cover" />
    </a>
  )
}
