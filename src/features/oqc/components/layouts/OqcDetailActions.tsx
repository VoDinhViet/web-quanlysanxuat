import { useNavigate } from "@tanstack/react-router"
import { Diskette, TrashBinTrash } from "@solar-icons/react"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button } from "@/components/ui/button"
import { DeleteOqcDialog } from "@/features/oqc/components/composites/DeleteOqcDialog"
import type { OqcDetailFormApi } from "@/features/oqc/components/sections/OqcDetailForm"
import { OqcStatus } from "@/lib/types/oqc.type"
import type { OqcDetail } from "@/lib/types/oqc.type"

type OqcDetailActionsProps = {
  form: OqcDetailFormApi
  oqc: OqcDetail
  isPending: boolean
}

// "Lưu" (`type="submit"`, nằm trong <form> bọc cả trang ở OqcDetailForm.tsx) — ẩn hẳn khi
// `isLocked` (status = COMPLETED, khoá vĩnh viễn — E177 nếu vẫn cố lưu). "Xoá phiếu" chỉ hiện khi
// NOT_INSPECTED (E178 chặn mọi trạng thái khác).
export function OqcDetailActions({
  form,
  oqc,
  isPending,
}: OqcDetailActionsProps) {
  const navigate = useNavigate({ from: "/manage/oqc/$oqcId" })

  const isLocked = oqc.status === OqcStatus.COMPLETED
  const canDelete = oqc.status === OqcStatus.DRAFT

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {canDelete && (
          <PermissionGate permission="oqc:delete">
            <DeleteOqcDialog
              oqc={oqc}
              onDeleted={() =>
                navigate({ to: "/manage/oqc", search: { page: 1, limit: 10 } })
              }
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive/40 text-destructive"
                >
                  <TrashBinTrash className="size-4" />
                  Xoá phiếu
                </Button>
              }
            />
          </PermissionGate>
        )}

        {!isLocked && (
          <PermissionGate permission="oqc:update">
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
          Đã hoàn tất — khoá vĩnh viễn, không thể sửa lại kết quả.
        </p>
      )}
    </div>
  )
}
