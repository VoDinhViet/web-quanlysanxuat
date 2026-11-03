import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Paperclip } from "lucide-react"
import { toast } from "sonner"

import { EvidenceUploadField } from "@/components/shared/composites/EvidenceUploadField"
import { QcEvidenceThumbnail } from "@/components/shared/composites/QcEvidenceThumbnail"
import { useHasPermission } from "@/hooks/use-permissions"
import { cn } from "@/lib/utils"
import type { FileFieldValue } from "@/lib/file-field.schema"
import type { FileResource, UploadType } from "@/lib/types/file.type"
import type { PermissionCode } from "@/lib/types/permission.type"

// Same cap as the backend's UpdateDocumentFilesReqDto.
const MAX_DOCUMENT_FILES = 20

type DocumentFilesCardProps = {
  files: FileResource[]
  // Must map to FileKind.EVIDENCE on the backend (images + documents).
  uploadType: UploadType
  permission: PermissionCode
  // A cancelled document stays readable but no longer changes.
  isLocked: boolean
  // Sends the whole list; resolves once the detail query has been refetched.
  onSave: (fileIds: string[]) => Promise<void>
  className?: string
}

// Attachments of a document, saved as soon as a file is uploaded or removed. Removing only unlinks
// the file from the document, the stored file stays.
export function DocumentFilesCard({
  files,
  uploadType,
  permission,
  isLocked,
  onSave,
  className,
}: DocumentFilesCardProps) {
  const hasPermission = useHasPermission(permission)
  const [isUploading, setIsUploading] = useState(false)
  const canEdit = hasPermission && !isLocked

  const mutation = useMutation({
    mutationFn: onSave,
    onSuccess: () => toast.success("Đã lưu file đính kèm"),
    onError: (error) => toast.error(error.message),
  })

  const handleChange = (
    next: FileFieldValue[] | ((prev: FileFieldValue[]) => FileFieldValue[])
  ) => {
    const nextFiles = typeof next === "function" ? next(files) : next

    if (nextFiles.length > MAX_DOCUMENT_FILES) {
      toast.error(`Mỗi phiếu đính kèm tối đa ${MAX_DOCUMENT_FILES} file.`)
      return
    }
    mutation.mutate(nextFiles.map((file) => file.id))
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg bg-card shadow-card",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold text-foreground sm:px-5">
        <Paperclip className="size-4 text-muted-foreground" />
        File đính kèm
        {canEdit && (
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {files.length}/{MAX_DOCUMENT_FILES}
          </span>
        )}
      </div>

      <div className="@container px-4 py-3.5 sm:px-5">
        {canEdit ? (
          <EvidenceUploadField
            value={files}
            onChange={handleChange}
            uploadType={uploadType}
            // Blocks a removal mid-upload: the upload's save would bring the removed file back.
            disabled={isUploading || mutation.isPending}
            onUploadingChange={setIsUploading}
          />
        ) : files.length > 0 ? (
          <ul className="grid @2xl:grid-cols-2 @2xl:gap-x-6">
            {files.map((file) => (
              <QcEvidenceThumbnail key={file.id} file={file} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Chưa có file đính kèm.
          </p>
        )}
      </div>
    </section>
  )
}
