import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Save, Trash2 } from "lucide-react"

import { PermissionGate } from "@/components/shared/PermissionGate"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteOqc } from "@/features/oqc/api/server-functions/delete-oqc.api"
import type { OqcDetailFormApi } from "@/features/oqc/hooks/use-oqc-detail-form"
import { OqcStatus } from "@/lib/types/oqc.type"
import type { OqcDetail } from "@/lib/types/oqc.type"

type OqcDetailActionsProps = {
  form: OqcDetailFormApi
  oqc: OqcDetail
  isLocked: boolean
  isPending: boolean
}

// "Lưu" (`type="submit"`, nằm trong <form> bọc cả trang ở OqcDetailForm.tsx) — ẩn hẳn khi
// `isLocked` (status = COMPLETED, khoá vĩnh viễn — E177 nếu vẫn cố lưu). "Xoá phiếu" chỉ hiện khi
// NOT_INSPECTED (E178 chặn mọi trạng thái khác).
export function OqcDetailActions({
  form,
  oqc,
  isLocked,
  isPending,
}: OqcDetailActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate({ from: "/manage/oqc/$oqcId" })
  const deleteOqcFn = useServerFn(deleteOqc)

  const deleteMutation = useMutation({
    mutationFn: () => deleteOqcFn({ data: { oqcId: oqc.id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["oqc"] })
      await navigate({ to: "/manage/oqc", search: { page: 1, limit: 10 } })
    },
  })

  const canDelete = oqc.status === OqcStatus.NOT_INSPECTED

  const closeDelete = (open: boolean) => {
    setDeleteOpen(open)
    if (!open) {
      deleteMutation.reset()
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {canDelete && (
          <PermissionGate permission="oqc:delete">
            <Button
              type="button"
              variant="outline"
              className="border-destructive/40 text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              Xoá phiếu
            </Button>
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
                  disabled={!canSubmit || isSubmitting || isPending}
                >
                  <Save className="size-4" />
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

      <Dialog open={deleteOpen} onOpenChange={closeDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá phiếu OQC</DialogTitle>
            <DialogDescription>
              Bạn chắc chắn muốn xoá phiếu{" "}
              <span className="font-mono font-semibold text-foreground">
                {oqc.code}
              </span>
              ? Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          {deleteMutation.error && (
            <p className="text-sm text-destructive">
              {deleteMutation.error.message}
            </p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => closeDelete(false)}
              disabled={deleteMutation.isPending}
            >
              Đóng
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Đang xoá…" : "Xoá phiếu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
