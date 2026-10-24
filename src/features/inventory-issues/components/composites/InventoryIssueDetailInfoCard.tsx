import { FileText, History } from "lucide-react"
import { DateTime } from "luxon"

import { ZoomableImage } from "@/components/shared/composites/ZoomableImage"
import { resolveFileUrl } from "@/lib/file-url"
import { InventoryIssueType } from "@/lib/types/inventory-issue.type"
import type { FileResource } from "@/lib/types/file.type"
import type { InventoryIssueDetail } from "@/lib/types/inventory-issue.type"

type InventoryIssueDetailInfoCardProps = {
  inventoryIssue: InventoryIssueDetail
}

// Cùng khuôn InventoryReceiptDetailInfoCard/InventoryRequisitionInfoCard — gộp mốc thời gian thật
// đang có (không dựng timeline giả nhiều bước), xem docs/domains/inventory.md.
export function InventoryIssueDetailInfoCard({
  inventoryIssue,
}: InventoryIssueDetailInfoCardProps) {
  const isFromRequisition =
    inventoryIssue.issueType === InventoryIssueType.PRODUCTION

  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-medium tracking-tight text-foreground sm:px-5">
        <History className="size-4 text-muted-foreground" />
        Nhật ký phiếu
      </div>

      <div className="flex flex-col gap-3 px-4 py-3.5 sm:px-5">
        <InfoRow
          label="Tạo lúc"
          value={`${DateTime.fromISO(inventoryIssue.createdAt).toFormat("dd/MM/yyyy HH:mm")}${inventoryIssue.creatorBy ? ` · ${inventoryIssue.creatorBy.fullName}` : ""}`}
        />

        {inventoryIssue.postedAt && (
          <InfoRow
            label="Xuất kho lúc"
            value={`${DateTime.fromISO(inventoryIssue.postedAt).toFormat("dd/MM/yyyy HH:mm")}${inventoryIssue.posterBy ? ` · ${inventoryIssue.posterBy.fullName}` : ""}`}
          />
        )}

        {inventoryIssue.postNote && (
          <InfoRow label="Ghi chú xuất kho" value={inventoryIssue.postNote} />
        )}

        {inventoryIssue.files.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Ảnh / file bằng chứng
            </p>
            <EvidenceGallery files={inventoryIssue.files} />
          </div>
        )}

        <InfoRow
          label="Cập nhật lần cuối"
          value={DateTime.fromISO(inventoryIssue.updatedAt).toFormat(
            "dd/MM/yyyy HH:mm"
          )}
        />
      </div>

      {isFromRequisition && (
        <p className="border-t border-border/60 px-4 py-3 text-xs text-muted-foreground sm:px-5">
          Phiếu này được tự sinh khi duyệt một phiếu lãnh vật tư — xem{" "}
          <span className="font-mono">docs/domains/inventory.md</span>{" "}
          (be-quanlysanxuat).
        </p>
      )}
    </section>
  )
}

type EvidenceGalleryProps = {
  files: FileResource[]
}

// Images zoom in place (a phone photo is the usual proof); scanned slips open in a new tab.
function EvidenceGallery({ files }: EvidenceGalleryProps) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {files.map((file) => (
        <li
          key={file.id}
          title={file.originalName}
          className="aspect-square overflow-hidden rounded-md border border-border bg-muted/30"
        >
          {file.mimetype.startsWith("image/") ? (
            <ZoomableImage
              src={resolveFileUrl(file.url)}
              alt={file.originalName}
            />
          ) : (
            <a
              href={resolveFileUrl(file.url)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Mở ${file.originalName} trong tab mới`}
              className="flex size-full items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <FileText className="size-5" aria-hidden />
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}

type InfoRowProps = {
  label: string
  value: string
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
