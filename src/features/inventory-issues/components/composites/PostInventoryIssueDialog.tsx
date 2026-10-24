import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { revalidateLogic } from "@tanstack/react-form"
import { toast } from "sonner"
import { CircleCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EvidenceUploadField } from "@/components/shared/composites/EvidenceUploadField"
import { postInventoryIssue } from "@/features/inventory-issues/api/server-functions/post-inventory-issue.api"
import { postInventoryIssueSchema } from "@/features/inventory-issues/schemas/post-inventory-issue.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { UploadType } from "@/lib/types/file.type"
import type { FileFieldValue } from "@/lib/file-field.schema"
import type { InventoryIssueDetail } from "@/lib/types/inventory-issue.type"

type PostInventoryIssueDialogProps = {
  inventoryIssue: InventoryIssueDetail
  isFromRequisition: boolean
}

// "Xuất kho" with optional proof the receiver got the goods: a note plus photos (camera on a phone)
// or scanned slips. Neither is required, so a quick issue still posts in one click.
export function PostInventoryIssueDialog({
  inventoryIssue,
  isFromRequisition,
}: PostInventoryIssueDialogProps) {
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()
  const postInventoryIssueFn = useServerFn(postInventoryIssue)

  const postMutation = useMutation({
    mutationFn: (value: { note?: string; files: FileFieldValue[] }) =>
      postInventoryIssueFn({
        data: { issueId: inventoryIssue.id, ...value },
      }),
    onSuccess: async () => {
      setOpen(false)
      toast.success("Đã xuất kho")
      // Posting moves stock and closes the requisition the issue was raised from.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory-issues"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-requisitions"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-products"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
      ])
    },
  })

  const form = useAppForm({
    defaultValues: { note: "", files: [] as FileFieldValue[] },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: postInventoryIssueSchema },
    onSubmit: ({ value }) =>
      postMutation.mutate(postInventoryIssueSchema.parse(value)),
  })

  const isBusy = postMutation.isPending || isUploading

  const handleOpenChange = (next: boolean) => {
    // Closing mid-upload would drop the photo into a form that was already reset.
    if (!next && isUploading) return
    setOpen(next)
    if (!next) {
      postMutation.reset()
      form.reset()
    }
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <CircleCheck className="size-4" />
        Xuất kho
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xuất kho</DialogTitle>
            <DialogDescription>
              Phiếu{" "}
              <span className="font-mono font-medium text-foreground">
                {inventoryIssue.code}
              </span>{" "}
              sẽ được xuất kho: tồn kho bị trừ và phiếu không thể chỉnh sửa sau
              đó.
              {isFromRequisition &&
                " Phiếu lãnh vật tư liên quan sẽ chuyển sang Đã xuất."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              if (form.state.isSubmitting || isUploading) return
              void form.handleSubmit()
            }}
            noValidate
            className="space-y-4"
          >
            <form.AppField name="note">
              {(field) => (
                <field.TextareaField
                  label="Ghi chú xuất kho (nếu có)"
                  placeholder="VD: người nhận, tình trạng hàng khi giao"
                  maxLength={500}
                  disabled={postMutation.isPending}
                />
              )}
            </form.AppField>

            <form.AppField name="files">
              {(field) => (
                <EvidenceUploadField
                  value={field.state.value}
                  onChange={field.handleChange}
                  uploadType={UploadType.INVENTORY_ISSUE_EVIDENCE}
                  disabled={postMutation.isPending}
                  onUploadingChange={setIsUploading}
                />
              )}
            </form.AppField>

            {postMutation.error && (
              <p className="text-sm text-destructive">
                {postMutation.error.message}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isBusy}
              >
                Đóng
              </Button>
              <Button type="submit" disabled={isBusy}>
                {isUploading
                  ? "Đang tải ảnh…"
                  : postMutation.isPending
                    ? "Đang xử lý…"
                    : "Xuất kho"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
