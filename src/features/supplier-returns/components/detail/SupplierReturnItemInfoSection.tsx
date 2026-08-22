import { useSuspenseQuery } from "@tanstack/react-query"
import { ImageOff, Package } from "lucide-react"
import type { ReactNode } from "react"

import { MissingSectionAlert } from "@/components/shared/feedback/MissingSectionAlert"
import { itemQueryOptions } from "@/features/products/api"
import { SupplierReturnDetailSectionCard } from "@/features/supplier-returns/components/detail/SupplierReturnDetailSectionCard"
import { SupplierReturnCodeCell } from "@/features/supplier-returns/components/SupplierReturnsTableCells"
import { resolveFileUrl } from "@/lib/file-url"
import type { SupplierReturnDetail } from "@/lib/types/supplier-return.type"
import type { FileResource } from "@/lib/types/file.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type SupplierReturnItemInfoSectionProps = {
  detail: SupplierReturnDetail
}

// Vật tư trả (image + fields) + Tham chiếu (IQC/nhập kho/PO) + Lý do trả folded into one card —
// same "several related blocks under one header, separated by dividers" idiom as
// IqcGeneralInfoCard.tsx, replacing what used to be 3 separate, mostly-thin cards
// (SupplierReturnReferenceCard + this section + SupplierReturnReasonSection). Everything except
// the image comes off `detail`/`detail.item` — already in the phiếu trả response, no extra wait.
// The image is `GET /api/items/:id`-only, so it (and only it) depends on itemQueryOptions,
// prefetched by the route loader alongside supplierQueryOptions.
export function SupplierReturnItemInfoSection({
  detail,
}: SupplierReturnItemInfoSectionProps) {
  const { data: item } = useSuspenseQuery(itemQueryOptions(detail.item.id))

  return (
    <SupplierReturnDetailSectionCard
      icon={Package}
      title="Thông tin vật tư trả"
      description="Vật tư, số lượng và các chứng từ liên quan"
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:gap-5">
          <div className="w-28 shrink-0">
            <ItemImagePreview image={item.image} name={detail.item.name} />
          </div>

          <dl className="grid flex-1 grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <InfoField
              label="Mã vật tư"
              value={
                <span className="font-mono text-primary">
                  {detail.item.code}
                </span>
              }
            />
            <InfoField label="Tên vật tư" value={detail.item.name} />
            <InfoField label="ĐVT" value={detail.item.unit.name} />
            <InfoField
              label="SL trả"
              value={
                <span className="font-mono text-primary">
                  {quantityFormatter.format(detail.quantity)}
                </span>
              }
            />
            <InfoField
              label="Ghi chú vật tư"
              value={detail.note ?? "—"}
              className="sm:col-span-2"
            />
          </dl>
        </div>

        <div className="space-y-3 border-b border-border pb-5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Tham chiếu
          </p>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
            <ReferenceField label="Mã IQC" code={detail.iqc?.code ?? null} />
            <ReferenceField
              label="Mã nhập kho"
              code={detail.inventoryReceipt?.code ?? null}
            />
            <ReferenceField
              label="PO"
              code={detail.purchaseOrder?.code ?? null}
            />
          </dl>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Lý do trả
          </p>
          <MissingSectionAlert>
            Chưa có API lưu lý do trả vật tư — mục này sẽ hiển thị khi backend
            hỗ trợ.
          </MissingSectionAlert>
        </div>
      </div>
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

type ReferenceFieldProps = {
  label: string
  code: string | null
}

function ReferenceField({ label, code }: ReferenceFieldProps) {
  return (
    <div>
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">
        <SupplierReturnCodeCell code={code} />
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
      <div className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-muted/30 text-center">
        <ImageOff className="size-6 text-muted-foreground/40" />
        <p className="text-[10px] font-medium text-muted-foreground">
          Chưa có ảnh
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
      />
    </a>
  )
}
