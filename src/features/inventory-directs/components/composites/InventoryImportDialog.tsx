import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  CircleAlert,
  FileSpreadsheet,
  Info,
  Loader2,
  Upload,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { importInventoryFile } from "@/features/inventory-directs/api/server-functions/import-inventory-file.api"
import { InventoryImportDropzone } from "@/features/inventory-directs/components/composites/InventoryImportDropzone"
import { InventoryImportTemplateCard } from "@/features/inventory-directs/components/composites/InventoryImportTemplateCard"
import type { InventoryImportResult } from "@/lib/types/inventory-direct.type"

function describeImportResult({ documents }: InventoryImportResult): string {
  if (documents.length === 0) {
    return "Tồn kho đã khớp với file, không có gì thay đổi"
  }

  const codes = documents.map((adjustment) => adjustment.code).join(", ")
  return `Đã nhập tồn kho (phiếu điều chỉnh ${codes})`
}

// Nhập tồn thực tế một lần từ file mẫu: không có bước xem trước, BE từ chối cả file nếu còn dòng
// lỗi nên danh sách lỗi hiện ngay trong dialog để sửa file rồi nhập lại.
export function InventoryImportDialog() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const importFn = useServerFn(importInventoryFile)

  const importMutation = useMutation({
    mutationFn: (selected: File) => {
      const formData = new FormData()
      formData.append("file", selected)
      return importFn({ data: formData })
    },
    onSuccess: async (importResult) => {
      toast.success(describeImportResult(importResult))
      setOpen(false)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory-directs"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-requisitions"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
      ])
    },
  })

  const selectFile = (selected: File | null) => {
    importMutation.reset()
    setFileError(null)
    setFile(selected)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    // Đang ghi sổ thì không cho đóng, tránh mở lại thấy dialog trống trong khi phiếu vẫn được ghi.
    if (!nextOpen && importMutation.isPending) return
    setOpen(nextOpen)
    if (nextOpen) selectFile(null)
  }

  const errorMessage = fileError ?? importMutation.error?.message

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" className="gap-1.5 text-xs">
            <FileSpreadsheet className="size-4 text-success" />
            Nhập tồn
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nhập tồn kho</DialogTitle>
          <DialogDescription>
            Số trong file là tồn thực tế. Hệ thống tự tính chênh lệch và cập
            nhật tồn ngay khi nhập.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <InventoryImportTemplateCard />

          <InventoryImportDropzone
            file={file}
            disabled={importMutation.isPending}
            onFileChange={selectFile}
            onFileReject={(message) => {
              selectFile(null)
              setFileError(message)
            }}
          />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="size-3.5 shrink-0" />
            File còn dòng lỗi thì chưa nhập dòng nào, sửa file rồi tải lại.
          </p>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>Chưa nhập được</AlertTitle>
            <AlertDescription className="max-h-48 overflow-y-auto leading-relaxed whitespace-pre-line">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={importMutation.isPending}
            onClick={() => setOpen(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="gap-1.5"
            disabled={!file || importMutation.isPending}
            onClick={() => file && importMutation.mutate(file)}
          >
            {importMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {importMutation.isPending ? "Đang nhập..." : "Nhập tồn kho"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
