import {
  AltArrowDown,
  DocumentText,
  File,
  FileDownload,
  Printer,
} from "@solar-icons/react"
import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { Loader2 } from "lucide-react"
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
import { exportOrderPdf } from "@/features/orders/api/server-functions/export-order-pdf.api"
import { exportOrdersExcel } from "@/features/orders/api/server-functions/export-orders-excel.api"
import {
  downloadBase64File,
  PDF_MIME_TYPE,
  printBase64Pdf,
  XLSX_MIME_TYPE,
} from "@/lib/download-file"

type OrderExportActionsProps = {
  orderId: string
}

export function OrderExportActions({ orderId }: OrderExportActionsProps) {
  const exportOrderPdfFn = useServerFn(exportOrderPdf)
  const exportOrdersExcelFn = useServerFn(exportOrdersExcel)

  const { mutateAsync: printPdf, isPending: isPrinting } = useMutation({
    mutationFn: () => exportOrderPdfFn({ data: { orderId } }),
  })

  const { mutateAsync: exportPdf, isPending: isExportingForm } = useMutation({
    mutationFn: () => exportOrderPdfFn({ data: { orderId } }),
  })

  const { mutateAsync: exportExcel, isPending: isExportingExcel } = useMutation(
    {
      mutationFn: () =>
        exportOrdersExcelFn({
          data: {
            orderIds: [orderId],
          },
        }),
    }
  )

  const handlePrint = () => {
    toast.promise(
      printPdf().then(({ base64 }) => {
        printBase64Pdf(base64)
      }),
      {
        loading: "Đang tải dữ liệu in...",
        success: "Đã mở bản in biểu mẫu",
        error: (error) => error.message || "In thất bại",
      }
    )
  }

  const handleExportForm = () => {
    toast.promise(
      exportPdf().then(({ base64, filename }) => {
        downloadBase64File(base64, filename, PDF_MIME_TYPE)
      }),
      {
        loading: "Đang tạo biểu mẫu đơn hàng...",
        success: "Đã xuất biểu mẫu đơn hàng (BM-01/KD)",
        error: (error) => error.message || "Xuất file thất bại",
      }
    )
  }

  const handleExportExcel = () => {
    toast.promise(
      exportExcel().then(({ base64, filename }) => {
        downloadBase64File(base64, filename, XLSX_MIME_TYPE)
      }),
      {
        loading: "Đang xuất bảng tính đơn hàng ra file Excel...",
        success: "Đã xuất bảng tính đơn hàng ra file Excel",
        error: (error) => error.message || "Xuất file thất bại",
      }
    )
  }

  const isExporting = isExportingForm || isExportingExcel

  return (
    <>
      <PermissionGate permission="orders:read">
        <Button
          type="button"
          variant="outline"
          disabled={isPrinting}
          onClick={handlePrint}
        >
          {isPrinting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Printer className="size-4" />
          )}
          In
        </Button>
      </PermissionGate>

      <PermissionGate permission="orders:read">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" variant="outline" disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileDownload className="size-4" />
                )}
                <span>Xuất</span>
                <AltArrowDown className="size-3.5 opacity-60" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-60 p-1.5">
            <DropdownMenuLabel className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
              Tùy chọn xuất dữ liệu
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              disabled={isExportingForm}
              onClick={handleExportForm}
              className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/80"
            >
              <DocumentText className="mt-0.5 size-4 shrink-0 text-rose-500" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  Biểu mẫu đơn hàng (BM-01/KD)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  File tài liệu PDF
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isExportingExcel}
              onClick={handleExportExcel}
              className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/80"
            >
              <File className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  Dữ liệu đơn hàng
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Bảng tính Excel (.xlsx)
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PermissionGate>
    </>
  )
}
