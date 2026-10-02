import { ErrorCode, useDropzone } from "react-dropzone"
import type { FileRejection } from "react-dropzone"
import { CloudUpload, FileText, TrashBin2 } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { XLSX_MIME_TYPE } from "@/lib/download-file"
import { cn } from "@/lib/utils"

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const kbFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 })

type ImportDirectsUploadCardProps = {
  file: File | null
  isPending: boolean
  rowCount: number
  onFileChange: (file: File | undefined) => void
  onFileReject: (message: string) => void
}

function resolveRejectionMessage(rejections: FileRejection[]): string {
  switch (rejections.at(0)?.errors.at(0)?.code) {
    case ErrorCode.FileInvalidType:
      return "Chỉ nhận file Excel .xlsx."
    case ErrorCode.FileTooLarge:
      return "File vượt quá 5MB."
    default:
      return "Không thể tải file lên."
  }
}

export function ImportDirectsUploadCard({
  file,
  isPending,
  rowCount,
  onFileChange,
  onFileReject,
}: ImportDirectsUploadCardProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { [XLSX_MIME_TYPE]: [".xlsx"] },
    maxSize: MAX_FILE_SIZE_BYTES,
    multiple: false,
    onDropAccepted: (files) => onFileChange(files.at(0)),
    onDropRejected: (rejections) =>
      onFileReject(resolveRejectionMessage(rejections)),
  })

  return (
    <section className="border-b border-border/60">
      {file ? (
        <div className="px-4 py-2.5 sm:px-5">
          <SelectedFile
            file={file}
            isPending={isPending}
            rowCount={rowCount}
            onClear={() => onFileChange(undefined)}
          />
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3 border-b border-border/60 px-4 py-3.5 sm:px-5">
            <CloudUpload className="mt-0.5 size-5 text-primary" />
            <div className="flex flex-col gap-0.5">
              <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
                Tải file lên
              </h2>
              <p className="text-xs text-muted-foreground">
                Chọn file Excel (.xlsx) đã điền theo mẫu, hệ thống sẽ tự đọc và
                kiểm tra dữ liệu.
              </p>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <div
              {...getRootProps({
                className: cn(
                  "flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors hover:border-primary hover:bg-primary/5",
                  isDragActive ? "border-primary bg-primary/5" : "bg-muted/30"
                ),
              })}
            >
              <input {...getInputProps()} />
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CloudUpload className="size-7" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-base font-semibold">
                  Kéo thả file Excel vào đây
                </span>
                <span className="text-sm text-muted-foreground">
                  hoặc{" "}
                  <span className="font-medium text-primary">
                    chọn từ máy tính
                  </span>
                </span>
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                .xlsx · tối đa 5MB · 1.000 dòng
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

type SelectedFileProps = {
  file: File
  isPending: boolean
  rowCount: number
  onClear: () => void
}

function SelectedFile({
  file,
  isPending,
  rowCount,
  onClear,
}: SelectedFileProps) {
  return (
    <div className="flex items-center gap-3">
      <FileText className="size-5 shrink-0 text-success" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isPending && <Spinner className="size-3" />}
          {isPending
            ? "Đang đọc file..."
            : `${kbFormatter.format(file.size / 1024)} KB · Đã đọc ${rowCount} dòng dữ liệu`}
        </p>
      </div>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Gỡ file"
              className="ml-auto shrink-0 text-muted-foreground hover:border-destructive/30 hover:text-destructive"
              disabled={isPending}
              onClick={onClear}
            >
              <TrashBin2 className="size-4" />
            </Button>
          }
        />
        <TooltipContent>Gỡ file</TooltipContent>
      </Tooltip>
    </div>
  )
}
