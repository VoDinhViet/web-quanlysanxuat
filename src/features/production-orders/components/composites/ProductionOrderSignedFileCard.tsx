import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { DateTime } from "luxon"
import prettyBytes from "pretty-bytes"
import { ErrorCode, useDropzone } from "react-dropzone"
import {
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { updateProductionOrderSignedFile } from "@/features/production-orders/api/server-functions/update-production-order-signed-file.api"
import { resolveFileUrl } from "@/lib/file-url"
import { UploadType } from "@/lib/types/file.type"
import { uploadFile } from "@/lib/upload-file"
import { cn } from "@/lib/utils"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"
import type { FileRejection } from "react-dropzone"

const ACCEPTED_SIGNED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
}

const MAX_SIGNED_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

function resolveDropRejectionMessage(rejections: FileRejection[]): string {
  const firstError = rejections.at(0)?.errors.at(0)
  switch (firstError?.code) {
    case ErrorCode.FileInvalidType:
      return "Định dạng tệp không được hỗ trợ. Vui lòng chọn file PDF hoặc ảnh (PNG, JPG, WEBP)."
    case ErrorCode.FileTooLarge:
      return "Kích thước tệp vượt quá giới hạn cho phép (tối đa 10MB)."
    case ErrorCode.TooManyFiles:
      return "Chỉ được tải lên 1 tệp LSX đã ký."
    default:
      return firstError?.message || "Không thể tải tệp lên. Vui lòng thử lại."
  }
}

type ProductionOrderSignedFileCardProps = {
  production: ProductionOrderDetail
}

export function ProductionOrderSignedFileCard({
  production,
}: ProductionOrderSignedFileCardProps) {
  const queryClient = useQueryClient()
  const uploadFileFn = useServerFn(uploadFile)
  const updateSignedFileFn = useServerFn(updateProductionOrderSignedFile)
  const [isDeleting, setIsDeleting] = useState(false)

  const { mutateAsync: saveSignedFile, isPending: isUploading } = useMutation({
    mutationFn: async (file: File) => {
      // 1. Upload file to static registry
      const body = new FormData()
      body.append("file", file)
      body.append("type", UploadType.PRODUCTION_ORDER_SIGNED_DOCUMENT)
      const uploadedFile = await uploadFileFn({ data: body })

      // 2. Link file with production order
      return updateSignedFileFn({
        data: {
          productionOrderId: production.id,
          signedFileId: uploadedFile.id,
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["production-orders"] })
      toast.success("Đã tải lên và lưu file LSX đã ký thành công")
    },
    onError: (error) => toast.error(error.message),
  })

  const { mutateAsync: removeSignedFile, isPending: isRemoving } = useMutation({
    mutationFn: async () => {
      return updateSignedFileFn({
        data: {
          productionOrderId: production.id,
          signedFileId: null,
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["production-orders"] })
      toast.success("Đã gỡ file LSX đã ký")
      setIsDeleting(false)
    },
    onError: (error) => {
      toast.error(error.message)
      setIsDeleting(false)
    },
  })

  const isBusy = isUploading || isRemoving || isDeleting

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPTED_SIGNED_FILE_TYPES,
    maxSize: MAX_SIGNED_FILE_SIZE_BYTES,
    multiple: false,
    disabled: isBusy,
    noClick: Boolean(production.signedFile), // If file exists, click on dropzone doesn't trigger; user uses buttons
    onDropAccepted: async (files) => {
      const file = files.at(0)
      if (file) {
        await saveSignedFile(file)
      }
    },
    onDropRejected: (rejections) => {
      toast.error(resolveDropRejectionMessage(rejections))
    },
  })

  const signedFile = production.signedFile
  const isPdf =
    signedFile?.mimetype === "application/pdf" ||
    signedFile?.originalName.toLowerCase().endsWith(".pdf")

  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FileCheck2 className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground sm:text-base">
                File Lệnh sản xuất (LSX) đã ký
              </h3>
              <p className="text-xs text-muted-foreground">
                Bản scan hoặc file PDF lưu trữ Lệnh sản xuất đã có chữ ký, dấu
                mộc xác nhận
              </p>
            </div>
          </div>

          {signedFile && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                Đã đính kèm
              </span>
            </div>
          )}
        </div>

        {signedFile ? (
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold",
                  isPdf
                    ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                    : "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                )}
              >
                {isPdf ? (
                  <FileText className="size-5" />
                ) : (
                  <ImageIcon className="size-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-xs font-semibold text-foreground sm:text-sm"
                  title={signedFile.originalName}
                >
                  {signedFile.originalName}
                </p>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted-foreground">
                  <span>{prettyBytes(signedFile.size)}</span>
                  <span>•</span>
                  <span>
                    Đã tải lên{" "}
                    {DateTime.fromISO(signedFile.createdAt).toFormat(
                      "dd/MM/yyyy HH:mm"
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() =>
                        window.open(resolveFileUrl(signedFile.url), "_blank")
                      }
                    >
                      <ExternalLink className="size-3.5" />
                      <span>Xem file</span>
                    </Button>
                  }
                />
                <TooltipContent>Mở tệp trong tab mới</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      render={
                        <a
                          href={resolveFileUrl(signedFile.url)}
                          download={signedFile.originalName}
                        />
                      }
                    >
                      <Download className="size-3.5" />
                      <span>Tải về</span>
                    </Button>
                  }
                />
                <TooltipContent>Tải bản scan/PDF về máy</TooltipContent>
              </Tooltip>

              <PermissionGate permission="production:update">
                <input {...getInputProps()} />

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isBusy}
                        className="h-8 gap-1.5 text-xs"
                        onClick={open}
                      >
                        {isUploading ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="size-3.5" />
                        )}
                        <span>Thay thế</span>
                      </Button>
                    }
                  />
                  <TooltipContent>Tải lên file mới thay thế</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isBusy}
                        className="h-8 gap-1.5 text-xs text-destructive hover:border-destructive/30 hover:bg-destructive/10"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Bạn có chắc chắn muốn gỡ bỏ file LSX đã ký này?"
                            )
                          ) {
                            setIsDeleting(true)
                            void removeSignedFile()
                          }
                        }}
                      >
                        {isRemoving || isDeleting ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                        <span>Xóa</span>
                      </Button>
                    }
                  />
                  <TooltipContent>Gỡ bỏ file này khỏi LSX</TooltipContent>
                </Tooltip>
              </PermissionGate>
            </div>
          </div>
        ) : (
          <PermissionGate
            permission="production:update"
            fallback={
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
                <FileText className="size-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">
                  Chưa có file LSX đã ký nào được đính kèm.
                </p>
              </div>
            }
          >
            <div
              {...getRootProps()}
              className={cn(
                "group relative flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-dashed border-border/80 bg-muted/10 p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/25",
                isDragActive && "border-primary bg-primary/5",
                isBusy && "pointer-events-none opacity-60"
              )}
            >
              <input {...getInputProps()} />

              <div className="flex size-11 items-center justify-center rounded-full bg-muted transition-transform group-hover:scale-105">
                {isUploading ? (
                  <Loader2 className="size-5 animate-spin text-primary" />
                ) : (
                  <UploadCloud className="size-5 text-muted-foreground group-hover:text-primary" />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground sm:text-sm">
                  {isUploading
                    ? "Đang tải lên và lưu file..."
                    : isDragActive
                      ? "Thả tệp vào đây..."
                      : "Kéo thả bản scan hoặc file PDF LSX đã ký vào đây, hoặc nhấn để chọn"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Hỗ trợ định dạng: PDF, PNG, JPG, WEBP (dung lượng tối đa 10MB)
                </p>
              </div>
            </div>
          </PermissionGate>
        )}
      </div>
    </section>
  )
}
