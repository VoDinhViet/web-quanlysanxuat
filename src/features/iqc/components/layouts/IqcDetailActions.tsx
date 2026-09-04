import { Link } from "@tanstack/react-router"
import { Diskette, MenuDots, Printer } from "@solar-icons/react"

import { PendingAction } from "@/components/shared/primitives/PendingAction"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  const { inventoryReceipt, purchaseOrder, supplierReturn } = iqc
  const hasOtherLinks =
    !!inventoryReceipt || !!purchaseOrder || !!supplierReturn

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <PendingAction label="In phiếu" hint="tính năng sắp có">
          <Printer className="size-4" />
          In phiếu
        </PendingAction>

        {hasOtherLinks && (
          <DropdownMenuTrigger>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Khác"
            >
              <MenuDots className="size-4" />
            </Button>
            <DropdownMenu placement="bottom end">
              {inventoryReceipt && (
                <DropdownMenuItem
                  href="#"
                  render={(props) =>
                    "href" in props ? (
                      <Link
                        {...props}
                        to="/manage/inventory-receipts/$inventoryReceiptId"
                        params={{ inventoryReceiptId: inventoryReceipt.id }}
                      />
                    ) : (
                      <div {...props} />
                    )
                  }
                >
                  Xem phiếu nhập kho
                </DropdownMenuItem>
              )}
              {purchaseOrder && (
                <DropdownMenuItem
                  href="#"
                  render={(props) =>
                    "href" in props ? (
                      <Link
                        {...props}
                        to="/manage/purchase-orders/$purchaseOrderId"
                        params={{ purchaseOrderId: purchaseOrder.id }}
                      />
                    ) : (
                      <div {...props} />
                    )
                  }
                >
                  Xem đơn mua hàng (PO)
                </DropdownMenuItem>
              )}
              {supplierReturn && (
                <DropdownMenuItem
                  href="#"
                  render={(props) =>
                    "href" in props ? (
                      <Link
                        {...props}
                        to="/manage/supplier-returns/$supplierReturnId"
                        params={{ supplierReturnId: supplierReturn.id }}
                      />
                    ) : (
                      <div {...props} />
                    )
                  }
                >
                  Xem phiếu trả NCC
                </DropdownMenuItem>
              )}
            </DropdownMenu>
          </DropdownMenuTrigger>
        )}

        {!isLocked && (
          <PermissionGate permission="iqc:update">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  isDisabled={!canSubmit || isSubmitting || isPending}
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
    </div>
  )
}
