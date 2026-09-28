import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { Loader2, Paperclip } from "lucide-react"
import { useDropzone } from "react-dropzone"

import {
  QcEvidenceThumbnail,
  resolveDropRejectionMessage,
} from "@/components/shared/composites/QcEvidenceThumbnail"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { usePasteToDropzone } from "@/hooks/use-paste-to-dropzone"
import {
  ACCEPTED_EVIDENCE_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  UploadType,
} from "@/lib/types/file.type"
import { uploadFile } from "@/lib/upload-file"
import { cn } from "@/lib/utils"
import type { FileFieldValue } from "@/lib/file-field.schema"

type QuotationSupplierAttachmentCellProps = {
  supplierName?: string
  value?: FileFieldValue[]
  disabled?: boolean
  onChange?: (value: FileFieldValue[]) => void
}

export function QuotationSupplierAttachmentCell({
  supplierName,
  value = [],
  disabled = false,
  onChange,
}: QuotationSupplierAttachmentCellProps) {
  const [open, setOpen] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)
  const uploadFileFn = useServerFn(uploadFile)

  const {
    mutateAsync: upload,
    error,
    isPending,
  } = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", UploadType.QUOTATION_SUPPLIER_EVIDENCE)
      return uploadFileFn({ data: formData })
    },
  })

  const { getRootProps, getInputProps, isDragActive, rootRef, inputRef } =
    useDropzone({
      accept: ACCEPTED_EVIDENCE_TYPES,
      maxSize: MAX_DOCUMENT_SIZE_BYTES,
      multiple: true,
      disabled: disabled || !onChange,
      onDropAccepted: async (acceptedFiles) => {
        setClientError(null)
        const results = await Promise.allSettled(
          acceptedFiles.map((file) => upload(file))
        )
        const uploaded = results
          .filter(
            (r): r is PromiseFulfilledResult<FileFieldValue> =>
              r.status === "fulfilled"
          )
          .map((r) => r.value)

        if (uploaded.length > 0 && onChange) {
          onChange([...value, ...uploaded])
        }

        const failedCount = results.length - uploaded.length
        if (failedCount > 0) {
          setClientError(
            `${failedCount} file tải lên thất bại. Vui lòng thử lại.`
          )
        }
      },
      onDropRejected: (rejections) =>
        setClientError(resolveDropRejectionMessage(rejections)),
    })

  usePasteToDropzone({ rootRef, inputRef, disabled: disabled || !onChange })

  const errorMessage = clientError ?? error?.message
  const fileCount = value.length

  if (disabled && !onChange && fileCount === 0) {
    return <span className="text-muted-foreground text-xs">—</span>
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant={fileCount > 0 ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-7 px-2 text-xs font-normal",
              fileCount > 0
                ? "font-medium text-primary bg-primary/10 hover:bg-primary/20"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={
              fileCount > 0
                ? `${fileCount} tệp đính kèm`
                : "Đính kèm tệp / ảnh / PDF"
            }
          >
            <Paperclip className="mr-1 size-3.5" />
            {fileCount > 0 ? `${fileCount} tệp` : "Đính kèm"}
          </Button>
        }
      />

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Paperclip className="size-4 text-primary" />
            Tệp đính kèm nhà cung cấp
          </DialogTitle>
          <DialogDescription>
            {supplierName ? (
              <span className="font-medium text-foreground">
                {supplierName}
              </span>
            ) : (
              "Chứng từ, bảng báo giá hoặc catalogue của nhà cung cấp"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!disabled && onChange && (
            <div
              {...getRootProps({
                role: "button",
                "aria-label": "Tải file lên",
                className: cn(
                  "relative w-full outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg cursor-pointer",
                  disabled && "pointer-events-none opacity-50"
                ),
              })}
            >
              <input {...getInputProps()} />
              <div
                className={cn(
                  "flex min-h-20 w-full items-center gap-3 rounded-lg border-2 border-dashed border-input bg-muted/30 px-4 py-3 transition-colors hover:border-primary/50 hover:bg-primary/5",
                  isDragActive && "border-primary bg-primary/5"
                )}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Paperclip className="size-5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    Kéo thả, dán (Ctrl+V) file vào đây hoặc{" "}
                    <span className="font-medium text-primary">chọn file</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Hỗ trợ: PDF, Ảnh, Word, Excel (tối đa 10MB)
                  </p>
                </div>

                {isPending && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          )}

          {errorMessage && (
            <p className="text-xs text-destructive">{errorMessage}</p>
          )}

          {fileCount > 0 ? (
            <div className="max-h-60 overflow-y-auto rounded-md border border-border/50 divide-y divide-border/40">
              {value.map((file) => (
                <QcEvidenceThumbnail
                  key={file.id}
                  file={file}
                  disabled={disabled || !onChange}
                  onRemove={(id) => {
                    if (onChange) {
                      onChange(value.filter((item) => item.id !== id))
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Chưa có tệp đính kèm nào.
            </p>
          )}
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline">
                Đóng
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
