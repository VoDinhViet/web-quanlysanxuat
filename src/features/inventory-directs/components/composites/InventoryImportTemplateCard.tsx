import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Download, FileSpreadsheet, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { downloadInventoryImportTemplate } from "@/features/inventory-directs/api/server-functions/download-inventory-import-template.api"
import { downloadBase64File, XLSX_MIME_TYPE } from "@/lib/download-file"

export function InventoryImportTemplateCard() {
  const templateFn = useServerFn(downloadInventoryImportTemplate)
  const { mutate: downloadTemplate, isPending } = useMutation({
    mutationFn: () => templateFn(),
    onSuccess: ({ base64, filename }) =>
      downloadBase64File(base64, filename, XLSX_MIME_TYPE),
    onError: (error) => toast.error(error.message),
  })

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success-ink">
        <FileSpreadsheet className="size-5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground">File mẫu tồn kho</p>
        <p className="text-xs text-muted-foreground">
          Có sẵn vật tư và tồn hiện tại. Chỉ điền cột "Tồn thực tế", để trống
          vật tư chưa kiểm.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 gap-1.5"
        disabled={isPending}
        onClick={() => downloadTemplate()}
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Download className="size-3.5" />
        )}
        Tải về
      </Button>
    </div>
  )
}
