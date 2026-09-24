import {
  AltArrowDown,
  CheckCircle,
  Diskette,
  DocumentText,
  FileDownload,
  Printer,
} from "@solar-icons/react"
import { Loader2 } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { ApproveProductionOrderDialog } from "@/features/production-orders/components/composites/ApproveProductionOrderDialog"
import { exportProductionOrderPdf } from "@/features/production-orders/api/server-functions/export-production-order-pdf.api"
import {
  downloadBase64File,
  PDF_MIME_TYPE,
  printBase64Pdf,
} from "@/lib/download-file"
import { ProductionOrderStatus } from "@/lib/types/production-order.type"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"

type ProductionOrderDetailActionsProps = {
  production: ProductionOrderDetail
  hasUnsavedChanges: boolean
  isSaving: boolean
  onSave: () => void
}

// "Lưu thay đổi" (production:update) và "Duyệt LSX" (production:approve) chỉ còn ý nghĩa khi LSX
// đang PENDING — một khi đã APPROVED, backend từ chối cả PATCH lẫn approve (not_editable /
// invalid_approval_state), nên 2 nút này ẩn hẳn thay vì hiện disabled. "Duyệt LSX" tự khoá (kèm
// tooltip) khi còn thay đổi chưa lưu — approve và lưu là hai quyền khác nhau
// (production:approve vs production:update), nên không thể tự động lưu rồi duyệt trong 1 lượt
// bấm như trước đây. Không có nút "Hủy LSX" — backend không có endpoint hủy và cũng không có kế
// hoạch gần nào cho tính năng này.
export function ProductionOrderDetailActions({
  production,
  hasUnsavedChanges,
  isSaving,
  onSave,
}: ProductionOrderDetailActionsProps) {
  const isPending = production.status === ProductionOrderStatus.PENDING
  const exportProductionOrderPdfFn = useServerFn(exportProductionOrderPdf)

  const { mutateAsync: exportPdf, isPending: isExporting } = useMutation({
    mutationFn: () =>
      exportProductionOrderPdfFn({
        data: { productionOrderId: production.id },
      }),
  })

  const { mutateAsync: printPdf, isPending: isPrinting } = useMutation({
    mutationFn: () =>
      exportProductionOrderPdfFn({
        data: { productionOrderId: production.id },
      }),
  })

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

  const handleExport = () => {
    toast.promise(
      exportPdf().then(({ base64, filename }) => {
        downloadBase64File(base64, filename, PDF_MIME_TYPE)
      }),
      {
        loading: "Đang tạo file PDF lệnh sản xuất...",
        success: "Đã xuất file PDF lệnh sản xuất",
        error: (error) => error.message || "Xuất file thất bại",
      }
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <PermissionGate permission="production:read">
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

      <PermissionGate permission="production:read">
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
              disabled={isExporting}
              onClick={handleExport}
              className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/80"
            >
              <DocumentText className="mt-0.5 size-4 shrink-0 text-rose-500" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  Biểu mẫu lệnh sản xuất
                </span>
                <span className="text-[11px] text-muted-foreground">
                  File tài liệu PDF
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PermissionGate>

      {isPending ? (
        <PermissionGate permission="production:update">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving || !hasUnsavedChanges}
            onClick={onSave}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Diskette className="size-4" />
            )}
            Lưu thay đổi
          </Button>
        </PermissionGate>
      ) : null}

      {isPending ? (
        <PermissionGate permission="production:approve">
          {hasUnsavedChanges || isSaving ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span tabIndex={0}>
                    <Button
                      type="button"
                      disabled
                      className="pointer-events-none"
                    >
                      <CheckCircle className="size-4" />
                      Duyệt LSX
                    </Button>
                  </span>
                }
              />
              <TooltipContent>
                Vui lòng lưu thay đổi trước khi duyệt LSX
              </TooltipContent>
            </Tooltip>
          ) : (
            <ApproveProductionOrderDialog
              production={production}
              trigger={
                <Button type="button">
                  <CheckCircle className="size-4" />
                  Duyệt LSX
                </Button>
              }
            />
          )}
        </PermissionGate>
      ) : null}
    </div>
  )
}
