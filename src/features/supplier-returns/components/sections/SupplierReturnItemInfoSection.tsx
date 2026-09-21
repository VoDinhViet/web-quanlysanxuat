import { useSuspenseQuery } from "@tanstack/react-query"
import { Package } from "lucide-react"
import { Gallery } from "@solar-icons/react"
import type { ReactNode } from "react"

import { useHasPermission } from "@/hooks/use-permissions"
import { itemQueryOptions } from "@/features/products/api"
import { SupplierReturnReasonField } from "@/features/supplier-returns/components/composites/SupplierReturnReasonField"
import { SupplierReturnDetailSectionCard } from "@/features/supplier-returns/components/layouts/SupplierReturnDetailSectionCard"
import { SupplierReturnCodeCell } from "@/features/supplier-returns/components/primitives/SupplierReturnTableCells"
import { resolveFileUrl } from "@/lib/file-url"
import { InventoryDocumentStatus } from "@/lib/types/supplier-return.type"
import type { SupplierReturnDetail } from "@/lib/types/supplier-return.type"
import type { FileResource } from "@/lib/types/file.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type SupplierReturnItemInfoSectionProps = {
  supplierReturn: SupplierReturnDetail
}

// Vật tư trả (image + fields) + Tham chiếu (IQC/nhập kho/PO) + Lý do trả folded into one card —
// same "several related blocks under one header, separated by dividers" idiom as
// IqcGeneralInfoCard.tsx, replacing what used to be 3 separate, mostly-thin cards
// (SupplierReturnReferenceCard + this section + SupplierReturnReasonSection). `item` null khi
// trả node COMPONENT nhận về từ OS-IN (không phải một item, docs/decisions/wip-removal.md) — dòng ảnh
// dispatch sang `null` (không ảnh để fetch), field mã/tên/đvt fallback về
// `itemCode`/`itemName`/không có đvt.
export function SupplierReturnItemInfoSection({
  supplierReturn,
}: SupplierReturnItemInfoSectionProps) {
  const canUpdate = useHasPermission("inventory:update")
  const isDraft = supplierReturn.status === InventoryDocumentStatus.DRAFT

  return (
    <SupplierReturnDetailSectionCard
      icon={Package}
      title="Thông tin vật tư trả"
      description="Vật tư, số lượng và các chứng từ liên quan"
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:gap-5">
          <div className="w-28 shrink-0">
            {supplierReturn.item ? (
              <SupplierReturnItemImage
                itemId={supplierReturn.item.id}
                name={supplierReturn.itemName}
              />
            ) : (
              <ItemImagePreview image={null} name={supplierReturn.itemName} />
            )}
          </div>

          <dl className="grid flex-1 grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <InfoField
              label="Mã vật tư"
              value={
                <span className="font-mono text-primary">
                  {supplierReturn.itemCode}
                </span>
              }
            />
            <InfoField label="Tên vật tư" value={supplierReturn.itemName} />
            <InfoField
              label="ĐVT"
              value={supplierReturn.item?.unit.name ?? "—"}
            />
            <InfoField
              label="SL trả"
              value={
                <span className="font-mono text-primary">
                  {quantityFormatter.format(supplierReturn.quantity)}
                </span>
              }
            />
            <InfoField
              label="Ghi chú vật tư"
              value={supplierReturn.note ?? "—"}
              className="sm:col-span-2"
            />
          </dl>
        </div>

        <div className="space-y-3 border-b border-border pb-5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Tham chiếu
          </p>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
            <ReferenceField
              label="Mã IQC"
              code={supplierReturn.iqc?.code ?? null}
            />
            <ReferenceField
              label="Mã nhập kho"
              code={supplierReturn.inventoryReceipt?.code ?? null}
            />
            <ReferenceField
              label="PO"
              code={supplierReturn.purchaseOrder?.code ?? null}
            />
          </dl>
        </div>

        <SupplierReturnReasonField
          supplierReturnId={supplierReturn.id}
          returnReason={supplierReturn.returnReason}
          editable={canUpdate && isDraft}
        />
      </div>
    </SupplierReturnDetailSectionCard>
  )
}

type SupplierReturnItemImageProps = {
  itemId: string
  name: string
}

// Tách khỏi component cha để `useSuspenseQuery` chỉ chạy khi thật sự có item — node COMPONENT không
// có `items` row nào để fetch, nên nhánh đó render thẳng `ItemImagePreview` ở call site.
function SupplierReturnItemImage({
  itemId,
  name,
}: SupplierReturnItemImageProps) {
  const { data: item } = useSuspenseQuery(itemQueryOptions(itemId))

  return <ItemImagePreview image={item.image} name={name} />
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
        <Gallery className="size-6 text-muted-foreground/40" />
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
