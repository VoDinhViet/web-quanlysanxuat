import { useSuspenseQuery } from "@tanstack/react-query"
import { ExternalLink } from "lucide-react"
import { Gallery } from "@solar-icons/react"
import type { ReactNode } from "react"

import { LinkButton } from "@/components/ui/button"
import { itemQueryOptions } from "@/features/products/api"
import { resolveFileUrl } from "@/lib/file-url"
import type { IqcDetail } from "@/lib/types/iqc.type"
import type { FileResource } from "@/lib/types/file.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type IqcConsumableStripProps = {
  iqc: IqcDetail
}

// Dải vật tư nổi bật ở đầu THÔNG TIN CHUNG — icon/ảnh + lưới nhãn/giá trị phẳng (không khung/nền
// riêng), cùng khuôn "MetaField" đã dùng ở IqcDetailHeader.tsx/PurchaseOrderDetailHeader.tsx: mã
// và số lượng tô `text-primary` (quy ước có sẵn của repo cho giá trị định danh, xem
// PurchaseRequestCreateQuantityColumns.tsx), các field còn lại giữ tông trung tính. `iqc.item`
// null khi lô kiểm là node COMPONENT nhận về từ OS-IN (không phải một item, docs/decisions/wip-removal.md)
// — dispatch sang dải rút gọn chỉ đọc `itemCode`/`itemName` snapshot, không ảnh/ghi chú/link (không
// có `items` row nào để fetch).
export function IqcConsumableStrip({ iqc }: IqcConsumableStripProps) {
  return iqc.item ? (
    <IqcItemConsumableStrip iqc={iqc} itemRef={iqc.item} />
  ) : (
    <IqcSnapshotConsumableStrip iqc={iqc} />
  )
}

type IqcItemConsumableStripProps = {
  iqc: IqcDetail
  itemRef: NonNullable<IqcDetail["item"]>
}

// Tên/mã/đvt/SL đọc thẳng từ `iqc.item`/`iqc.quantity` (đã có sẵn trong response IQC); ảnh + ghi
// chú vật tư cần `GET /api/items/:id` (itemQueryOptions, prefetch phụ thuộc ở route loader — xem
// $iqcId.tsx).
function IqcItemConsumableStrip({ iqc, itemRef }: IqcItemConsumableStripProps) {
  const { data: item } = useSuspenseQuery(itemQueryOptions(itemRef.id))

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <ItemImagePreview image={item.image} name={itemRef.name} />

      <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <InfoField
          label="Mã vật tư"
          value={<span className="font-mono text-primary">{itemRef.code}</span>}
        />
        <InfoField label="Tên vật tư" value={itemRef.name} />
        <InfoField label="Đơn vị" value={itemRef.unit.name} />
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

      <LinkButton
        to="/manage/consumables/$consumableId/update"
        params={{ consumableId: itemRef.id }}
        variant="ghost"
        size="icon"
        aria-label="Xem vật tư"
        className="self-start text-muted-foreground sm:self-center"
      >
        <ExternalLink className="size-4" />
      </LinkButton>
    </div>
  )
}

function IqcSnapshotConsumableStrip({ iqc }: IqcConsumableStripProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
        <Gallery className="size-5 text-muted-foreground/40" />
      </div>

      <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <InfoField
          label="Mã part"
          value={<span className="font-mono text-primary">{iqc.itemCode}</span>}
        />
        <InfoField label="Tên part" value={iqc.itemName} />
        <InfoField
          label="Số lượng"
          value={
            <span className="font-mono text-primary">
              {quantityFormatter.format(iqc.quantity)}
            </span>
          }
        />
      </dl>
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
        <Gallery className="size-5 text-muted-foreground/40" />
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
