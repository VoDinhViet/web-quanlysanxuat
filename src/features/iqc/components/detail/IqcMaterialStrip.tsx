import { Link } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ExternalLink, ImageOff } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { itemQueryOptions } from "@/features/products/api"
import { resolveFileUrl } from "@/lib/file-url"
import type { IqcDetail } from "@/lib/types/iqc.type"
import type { FileResource } from "@/lib/types/file.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type IqcMaterialStripProps = {
  iqc: IqcDetail
}

// Dải vật tư nổi bật ở đầu THÔNG TIN CHUNG — icon/ảnh + lưới nhãn/giá trị phẳng (không khung/nền
// riêng), cùng khuôn "MetaField" đã dùng ở IqcDetailHeader.tsx/PurchaseOrderDetailHeader.tsx: mã
// và số lượng tô `text-primary` (quy ước có sẵn của repo cho giá trị định danh, xem
// PurchaseRequestCreateQuantityColumns.tsx), các field còn lại giữ tông trung tính. Tên/mã/đvt/SL
// đọc thẳng từ `iqc.item`/`iqc.quantity` (đã có sẵn trong response IQC); ảnh + ghi chú vật tư cần
// `GET /api/items/:id` (itemQueryOptions, prefetch phụ thuộc ở route loader — xem $iqcId.tsx).
export function IqcMaterialStrip({ iqc }: IqcMaterialStripProps) {
  const { data: item } = useSuspenseQuery(itemQueryOptions(iqc.item.id))

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <ItemImagePreview image={item.image} name={iqc.item.name} />

      <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <InfoField
          label="Mã vật tư"
          value={
            <span className="font-mono text-primary">{iqc.item.code}</span>
          }
        />
        <InfoField label="Tên vật tư" value={iqc.item.name} />
        <InfoField label="Đơn vị" value={iqc.item.unit.name} />
        <InfoField
          label="Số lượng"
          value={
            <span className="font-mono text-primary">
              {quantityFormatter.format(iqc.quantity)}
            </span>
          }
        />
        <InfoField
          label="Ghi chú"
          value={item.note ?? "—"}
          className="col-span-2 sm:col-span-4"
        />
      </dl>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Xem vật tư"
        className="self-start text-muted-foreground sm:self-center"
        asChild
      >
        <Link
          to="/manage/materials/$materialId/update"
          params={{ materialId: iqc.item.id }}
        >
          <ExternalLink className="size-4" />
        </Link>
      </Button>
    </div>
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
        <ImageOff className="size-5 text-muted-foreground/40" />
      </div>
    )
  }

  return (
    <a
      href={resolveFileUrl(image.url)}
      target="_blank"
      rel="noreferrer"
      className="block size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30"
    >
      <img
        src={resolveFileUrl(image.url)}
        alt={name}
        className="size-full object-cover"
      />
    </a>
  )
}
