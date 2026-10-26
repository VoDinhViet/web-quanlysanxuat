import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { ChevronDown, FileDown, FileText, Loader2, Printer } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { exportPurchaseRequestPdf } from "@/features/purchase-requests/api/server-functions/export-purchase-request-pdf.api"
import {
  downloadBase64File,
  PDF_MIME_TYPE,
  printBase64Pdf,
} from "@/lib/download-file"

type PurchaseRequestExportActionsProps = {
  purchaseRequestId: string
}

export function PurchaseRequestExportActions({
  purchaseRequestId,
}: PurchaseRequestExportActionsProps) {
  const exportPurchaseRequestPdfFn = useServerFn(exportPurchaseRequestPdf)

  const { mutateAsync: fetchPdf, isPending: isFetchingPdf } = useMutation({
    mutationFn: () =>
      exportPurchaseRequestPdfFn({ data: { purchaseRequestId } }),
  })

  const handlePrint = () => {
    toast.promise(
      fetchPdf().then(({ base64 }) => {
        printBase64Pdf(base64)
      }),
      {
        loading: "Đang tải dữ liệu in...",
        success: "Đã mở bản in đề xuất mua hàng",
        error: (error) => error.message || "In thất bại",
      }
    )
  }

  const handleExportPdf = () => {
    toast.promise(
      fetchPdf().then(({ base64, filename }) => {
        downloadBase64File(base64, filename, PDF_MIME_TYPE)
      }),
      {
        loading: "Đang tạo phiếu đề xuất mua hàng...",
        success: "Đã xuất phiếu đề xuất mua hàng (BM 07-01)",
        error: (error) => error.message || "Xuất file thất bại",
      }
    )
  }

  return (
    <PermissionGate permission="purchase-requests:read">
      <Button
        type="button"
        variant="outline"
        disabled={isFetchingPdf}
        onClick={handlePrint}
      >
        {isFetchingPdf ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Printer className="size-4" />
        )}
        In
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button type="button" variant="outline" disabled={isFetchingPdf}>
              <FileDown className="size-4" />
              <span>Xuất</span>
              <ChevronDown className="size-3.5 opacity-60" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-60 p-1.5">
          <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
            Tùy chọn xuất dữ liệu
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            disabled={isFetchingPdf}
            onClick={handleExportPdf}
            className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/80"
          >
            <FileText className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">
                Phiếu đề xuất mua hàng
              </span>
              <span className="text-xs text-muted-foreground">
                File tài liệu PDF
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </PermissionGate>
  )
}
