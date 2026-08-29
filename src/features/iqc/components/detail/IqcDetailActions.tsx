import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Diskette, MenuDots, Printer } from "@solar-icons/react"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IqcPrintDialog } from "@/features/iqc/components/detail/IqcPrintDialog"
import type { IqcDetailFormApi } from "@/features/iqc/hooks/use-iqc-detail-form"
import type { IqcDetail } from "@/lib/types/iqc.type"

type IqcDetailActionsProps = {
  form: IqcDetailFormApi
  iqc: IqcDetail
  isLocked: boolean
  isPending: boolean
}

// "In phiếu" + "Khác" (link sang PNK/PO/phiếu trả NCC liên quan, chỉ hiện mục nào thật sự có) +
// "Lưu" (`type="submit"`, nằm trong <form> bọc cả trang ở IqcDetailForm.tsx). Ẩn hẳn nút Lưu khi
// `isLocked` (status = WAITING_RETURN, đã chốt đường trả NCC — E159 nếu vẫn cố lưu).
export function IqcDetailActions({
  form,
  iqc,
  isLocked,
  isPending,
}: IqcDetailActionsProps) {
  const [printOpen, setPrintOpen] = useState(false)
  const hasOtherLinks =
    !!iqc.inventoryReceipt || !!iqc.purchaseOrder || !!iqc.supplierReturn

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setPrintOpen(true)}
        >
          <Printer className="size-4" />
          In phiếu
        </Button>

        {hasOtherLinks && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Khác"
              >
                <MenuDots className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {iqc.inventoryReceipt && (
                <DropdownMenuItem asChild>
                  <Link
                    to="/manage/inventory-receipts/$inventoryReceiptId"
                    params={{ inventoryReceiptId: iqc.inventoryReceipt.id }}
                  >
                    Xem phiếu nhập kho
                  </Link>
                </DropdownMenuItem>
              )}
              {iqc.purchaseOrder && (
                <DropdownMenuItem asChild>
                  <Link
                    to="/manage/purchase-orders/$purchaseOrderId"
                    params={{ purchaseOrderId: iqc.purchaseOrder.id }}
                  >
                    Xem đơn mua hàng (PO)
                  </Link>
                </DropdownMenuItem>
              )}
              {iqc.supplierReturn && (
                <DropdownMenuItem asChild>
                  <Link
                    to="/manage/supplier-returns/$supplierReturnId"
                    params={{ supplierReturnId: iqc.supplierReturn.id }}
                  >
                    Xem phiếu trả NCC
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {!isLocked && (
          <PermissionGate permission="iqc:update">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || isPending}
                >
                  <Diskette className="size-4" />
                  {isSubmitting || isPending ? "Đang lưu..." : "Lưu"}
                </Button>
              )}
            </form.Subscribe>
          </PermissionGate>
        )}
      </div>

      {isLocked && (
        <p className="max-w-64 text-right text-[11px] text-muted-foreground">
          Đã chốt đường trả NCC — không sửa được kết quả IQC nữa.
        </p>
      )}

      <IqcPrintDialog open={printOpen} onOpenChange={setPrintOpen} iqc={iqc} />
    </div>
  )
}
