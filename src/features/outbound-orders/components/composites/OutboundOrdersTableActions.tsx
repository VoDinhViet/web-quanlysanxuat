import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { Download, Plus, Printer } from "lucide-react"
import { toast } from "sonner"

import { Button, LinkButton } from "@/components/ui/button"
import { PendingAction } from "@/components/shared/primitives/PendingAction"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { exportOutboundOrders } from "@/features/outbound-orders/api/server-functions/export-outbound-orders.api"
import type { OutboundOrdersSearchSchema } from "@/features/outbound-orders/schemas/outbound-orders-search.schema"
import { downloadBase64File, XLSX_MIME_TYPE } from "@/lib/download-file"

type OutboundOrdersTableActionsProps = {
  // Bộ lọc đang áp dụng (từ URL) — Excel xuất đúng danh sách đang xem, không phải các ô vừa sửa mà chưa bấm Tìm kiếm.
  search: OutboundOrdersSearchSchema
}

export function OutboundOrdersTableActions({
  search,
}: OutboundOrdersTableActionsProps) {
  const exportOutboundOrdersFn = useServerFn(exportOutboundOrders)
  const { mutateAsync: exportExcel, isPending: isExporting } = useMutation({
    mutationFn: () => exportOutboundOrdersFn({ data: search }),
  })

  const handleExport = () => {
    toast.promise(
      exportExcel().then(({ base64, filename }) => {
        downloadBase64File(base64, filename, XLSX_MIME_TYPE)
      }),
      {
        loading: "Đang xuất file Excel lệnh xuất kho...",
        success: "Đã xuất file Excel lệnh xuất kho",
        error: (error) => error.message || "Xuất file thất bại",
      }
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        className="text-xs"
        disabled={isExporting}
        onClick={handleExport}
      >
        <Download className="size-4" />
        {isExporting ? "Đang xuất..." : "Xuất Excel"}
      </Button>

      <PendingAction label="In danh sách" hint="Tính năng in danh sách sắp có">
        <Printer className="size-4 text-muted-foreground" />
        In danh sách
      </PendingAction>

      <RoutePermissionGate route="/manage/outbound-orders/create">
        <LinkButton to="/manage/outbound-orders/create" className="text-xs">
          <Plus className="size-4" />
          Tạo DO mới
        </LinkButton>
      </RoutePermissionGate>
    </div>
  )
}
