import { useServerFn } from "@tanstack/react-start"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button } from "@/components/ui/button"
import { approveNcr } from "@/features/ncrs/api/server-functions/approve-ncr.api"
import { closeNcr } from "@/features/ncrs/api/server-functions/close-ncr.api"
import { createNcrProductionOrder } from "@/features/ncrs/api/server-functions/create-ncr-production-order.api"
import { skipNcrProductionOrder } from "@/features/ncrs/api/server-functions/skip-ncr-production-order.api"
import { submitNcr } from "@/features/ncrs/api/server-functions/submit-ncr.api"
import { RejectNcrDialog } from "@/features/ncrs/components/composites/RejectNcrDialog"
import { RequestNcrOqcDialog } from "@/features/ncrs/components/composites/RequestNcrOqcDialog"
import { useNcrAction } from "@/features/ncrs/hooks/use-ncr-action"
import { NcrProductionAction, NcrStatus } from "@/lib/types/ncr.type"
import type { NcrDetail } from "@/lib/types/ncr.type"

type NcrDetailActionsProps = {
  ncr: NcrDetail
}

// Header actions by status. `Gửi duyệt` uses the saved analysis (the form's own "Lưu" runs first);
// after approval an NCR with no repair/remake quantity can only be closed, otherwise the user
// picks LSX sửa chữa / LSX làm mới / không tạo LSX, then QC re-checks via OQC.
export function NcrDetailActions({ ncr }: NcrDetailActionsProps) {
  const submitNcrFn = useServerFn(submitNcr)
  const approveNcrFn = useServerFn(approveNcr)
  const closeNcrFn = useServerFn(closeNcr)
  const skipNcrProductionOrderFn = useServerFn(skipNcrProductionOrder)
  const createProductionOrderFn = useServerFn(createNcrProductionOrder)

  const submit = useNcrAction({
    mutationFn: (ncrId) => submitNcrFn({ data: { ncrId } }),
    successMessage: "Đã gửi duyệt NCR",
  })
  const approve = useNcrAction({
    mutationFn: (ncrId) => approveNcrFn({ data: { ncrId } }),
    successMessage: "Đã duyệt NCR",
  })
  const close = useNcrAction({
    mutationFn: (ncrId) => closeNcrFn({ data: { ncrId } }),
    successMessage: "Đã đóng NCR",
  })
  const skipProductionOrder = useNcrAction({
    mutationFn: (ncrId) => skipNcrProductionOrderFn({ data: { ncrId } }),
    successMessage: "NCR chuyển sang chờ OQC lại",
  })
  const createReworkOrder = useNcrAction({
    mutationFn: (ncrId) =>
      createProductionOrderFn({
        data: { ncrId, action: NcrProductionAction.REWORK },
      }),
    successMessage: "Đã tạo LSX sửa chữa",
  })
  const createRemakeOrder = useNcrAction({
    mutationFn: (ncrId) =>
      createProductionOrderFn({
        data: { ncrId, action: NcrProductionAction.REMAKE },
      }),
    successMessage: "Đã tạo LSX làm mới",
  })

  const hasProductionOrder = (action: NcrProductionAction) =>
    ncr.productionOrders.some(
      (productionOrder) => productionOrder.ncrAction === action
    )
  const processingQty = ncr.reworkQty + ncr.remakeQty
  const canCreateRework =
    ncr.reworkQty > 0 && !hasProductionOrder(NcrProductionAction.REWORK)
  const canCreateRemake =
    ncr.remakeQty > 0 && !hasProductionOrder(NcrProductionAction.REMAKE)
  const isDecidingProduction =
    ncr.status === NcrStatus.APPROVED || ncr.status === NcrStatus.IN_PROGRESS

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(ncr.status === NcrStatus.OPEN || ncr.status === NcrStatus.REJECTED) && (
        <PermissionGate permission="ncr:update">
          <Button
            type="button"
            disabled={submit.isPending}
            onClick={() => submit.mutate(ncr.id)}
          >
            {submit.isPending ? "Đang gửi..." : "Gửi duyệt"}
          </Button>
        </PermissionGate>
      )}

      {ncr.status === NcrStatus.PENDING_APPROVAL && (
        <PermissionGate permission="ncr:approve">
          <RejectNcrDialog
            ncr={ncr}
            trigger={
              <Button type="button" variant="outline">
                Không duyệt
              </Button>
            }
          />
          <Button
            type="button"
            disabled={approve.isPending}
            onClick={() => approve.mutate(ncr.id)}
          >
            {approve.isPending ? "Đang duyệt..." : "Duyệt"}
          </Button>
        </PermissionGate>
      )}

      {ncr.status === NcrStatus.APPROVED && processingQty === 0 && (
        <PermissionGate permission="ncr:update">
          <Button
            type="button"
            disabled={close.isPending}
            onClick={() => close.mutate(ncr.id)}
          >
            {close.isPending ? "Đang đóng..." : "Đóng NCR"}
          </Button>
        </PermissionGate>
      )}

      {isDecidingProduction && processingQty > 0 && (
        <PermissionGate permission="ncr:update">
          {ncr.status === NcrStatus.APPROVED && (
            <Button
              type="button"
              variant="outline"
              disabled={skipProductionOrder.isPending}
              onClick={() => skipProductionOrder.mutate(ncr.id)}
            >
              Không tạo LSX
            </Button>
          )}
          {canCreateRework && (
            <Button
              type="button"
              disabled={createReworkOrder.isPending}
              onClick={() => createReworkOrder.mutate(ncr.id)}
            >
              Tạo LSX sửa chữa
            </Button>
          )}
          {canCreateRemake && (
            <Button
              type="button"
              disabled={createRemakeOrder.isPending}
              onClick={() => createRemakeOrder.mutate(ncr.id)}
            >
              Tạo LSX làm mới
            </Button>
          )}
        </PermissionGate>
      )}

      {ncr.status === NcrStatus.PENDING_QC && ncr.productionJob && (
        <PermissionGate permission={["ncr:update", "oqc:create"]}>
          <RequestNcrOqcDialog
            ncr={ncr}
            trigger={<Button type="button">Yêu cầu OQC lại</Button>}
          />
        </PermissionGate>
      )}
    </div>
  )
}
