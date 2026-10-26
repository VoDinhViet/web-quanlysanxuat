import { ErrorCode, useDropzone } from "react-dropzone"
import type { FileRejection } from "react-dropzone"
import { FileSpreadsheet, UploadCloud, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { INVENTORY_IMPORT_MAX_FILE_BYTES } from "@/features/inventory-directs/constants/inventory-import-template"
import { usePasteToDropzone } from "@/hooks/use-paste-to-dropzone"
import { XLSX_MIME_TYPE } from "@/lib/download-file"
import { cn } from "@/lib/utils"

const kbFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 })

type InventoryImportDropzoneProps = {
  file: File | null
  disabled: boolean
  onFileChange: (file: File | null) => void
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

function isXlsxFile(file: File) {
  return (
    file.type === XLSX_MIME_TYPE || file.name.toLowerCase().endsWith(".xlsx")
  )
}

// Ba cách đưa file vào như các ô tải lên khác: kéo thả, bấm chọn, hoặc Ctrl+V file đã copy.
export function InventoryImportDropzone({
  file,
  disabled,
  onFileChange,
  onFileReject,
}: InventoryImportDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive, rootRef, inputRef } =
    useDropzone({
      accept: { [XLSX_MIME_TYPE]: [".xlsx"] },
      maxSize: INVENTORY_IMPORT_MAX_FILE_BYTES,
      multiple: false,
      disabled,
      onDropAccepted: (files) => onFileChange(files.at(0) ?? null),
      onDropRejected: (rejections) =>
        onFileReject(resolveRejectionMessage(rejections)),
    })

  usePasteToDropzone({ rootRef, inputRef, acceptsFile: isXlsxFile, disabled })

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
        <FileSpreadsheet className="size-8 shrink-0 text-success" />
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {kbFormatter.format(file.size / 1024)} KB · File Excel
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Bỏ file đã chọn"
          className="ml-auto shrink-0 text-muted-foreground hover:text-destructive"
          disabled={disabled}
          onClick={() => onFileChange(null)}
        >
          <X className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps({
        role: "button",
        "aria-label": "Chọn file Excel tồn kho",
        className: cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors outline-none hover:border-primary hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring",
          isDragActive ? "border-primary bg-primary/5" : "bg-muted/20"
        ),
      })}
    >
      <input {...getInputProps()} />
      <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UploadCloud className="size-5" />
      </span>
      <p className="text-sm font-medium">
        Kéo thả file vào đây hoặc{" "}
        <span className="text-primary">chọn từ máy tính</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Hoặc copy file rồi nhấn Ctrl+V · .xlsx, tối đa 5MB
      </p>
    </div>
  )
}
