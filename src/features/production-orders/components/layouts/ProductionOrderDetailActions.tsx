import { CircleCheck, Download, Loader2, Save } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { ApproveProductionOrderDialog } from "@/features/production-orders/components/composites/ApproveProductionOrderDialog"
import { exportProductionOrderPdf } from "@/features/production-orders/api/server-functions/export-production-order-pdf.api"
import { downloadBase64File, PDF_MIME_TYPE } from "@/lib/download-file"
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

  const handleExport = () => {
    toast.promise(
      exportPdf().then(({ base64, filename }) => {
        downloadBase64File(base64, filename, PDF_MIME_TYPE)
      }),
      {
        loading: "Đang tạo file PDF lệnh sản xuất...",
        success: "Đã xuất file PDF lệnh sản xuất",
        error: (error) => error.message || "Xuất file thất bại",
      },
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <PermissionGate permission="production:read">
        <Button
          type="button"
          variant="outline"
          disabled={isExporting}
          onClick={handleExport}
        >
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Xuất PDF
        </Button>
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
              <Save className="size-4" />
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
                      <CircleCheck className="size-4" />
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
                  <CircleCheck className="size-4" />
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
