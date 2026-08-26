import { DateTime } from "luxon"
import { FileText, PackageCheck } from "lucide-react"
import type { ReactNode } from "react"

import { SupplierReturnDetailSectionCard } from "@/features/supplier-returns/components/detail/SupplierReturnDetailSectionCard"
import { resolveFileUrl } from "@/lib/file-url"
import { InventoryDocumentStatus } from "@/lib/types/supplier-return.type"
import type { SupplierReturnDetail } from "@/lib/types/supplier-return.type"
import type { FileResource } from "@/lib/types/file.type"

type SupplierReturnWarehouseSectionProps = {
  detail: SupplierReturnDetail
}

// "Kho xuất trả" now lives in the header's meta grid. This card is about the export event
// itself: `posterBy`/`postedAt`/`postNote`/`files` are all only real once `status` reaches
// POSTED — `postNote`/`files` come from the `post` call's optional body (see
// SupplierReturnDetailActions.tsx), so a POSTED return can still legitimately have neither.
export function SupplierReturnWarehouseSection({
  detail,
}: SupplierReturnWarehouseSectionProps) {
  const isPosted = detail.status === InventoryDocumentStatus.POSTED

  return (
    <SupplierReturnDetailSectionCard
      icon={PackageCheck}
      title="Xác nhận xuất trả"
      description={isPosted ? "Đã xuất trả kho" : "Chờ kho xác nhận xuất trả"}
    >
      <div className="space-y-4">
        {isPosted && detail.postedAt ? (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <InfoField
              label="Người xuất trả"
              value={detail.posterBy?.fullName ?? "—"}
            />
            <InfoField
              label="Ngày xuất trả"
              value={DateTime.fromISO(detail.postedAt).toFormat(
                "dd/MM/yyyy HH:mm"
              )}
            />
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            Phiếu chưa được xác nhận xuất — người xuất trả và ngày xuất trả sẽ
            hiển thị ở đây sau khi kho xác nhận.
          </p>
        )}

        {isPosted && (
          <div className="space-y-4 border-t border-border pt-4">
            <dl>
              <InfoField
                label="Ghi chú xuất trả"
                value={detail.postNote ?? "Không có ghi chú."}
              />
            </dl>

            {detail.files.length > 0 ? (
              <EvidenceGallery files={detail.files} />
            ) : (
              <p className="text-xs text-muted-foreground">
                Không có file đính kèm.
              </p>
            )}
          </div>
        )}
      </div>
    </SupplierReturnDetailSectionCard>
  )
}

type EvidenceGalleryProps = {
  files: FileResource[]
}

function EvidenceGallery({ files }: EvidenceGalleryProps) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
      {files.map((file) => (
        <li key={file.id}>
          <a
            href={resolveFileUrl(file.url)}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1 rounded-md border border-border bg-muted/30 p-1.5"
          >
            {file.mimetype.startsWith("image/") ? (
              <img
                src={resolveFileUrl(file.url)}
                alt={file.originalName}
                className="aspect-square w-full rounded object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded bg-muted text-muted-foreground">
                <FileText className="size-6" />
              </div>
            )}
            <span className="w-full truncate text-center text-[10px] text-muted-foreground">
              {file.originalName}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

type InfoFieldProps = {
  label: string
  value: ReactNode
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium break-words text-foreground">
        {value}
      </dd>
    </div>
  )
}
