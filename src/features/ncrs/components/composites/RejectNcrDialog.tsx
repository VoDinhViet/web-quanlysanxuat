import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { CircleX } from "lucide-react"
import type { ReactElement } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { rejectNcr } from "@/features/ncrs/api/server-functions/reject-ncr.api"
import { rejectNcrSchema } from "@/features/ncrs/schemas/reject-ncr.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type { NcrDetail } from "@/lib/types/ncr.type"

type RejectNcrDialogProps = {
  ncr: NcrDetail
  trigger: ReactElement
}

// PENDING_APPROVAL → REJECTED, reason required — NCR goes back to the analysis form.
export function RejectNcrDialog({ ncr, trigger }: RejectNcrDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <RejectNcrForm ncr={ncr} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

type RejectNcrFormProps = {
  ncr: NcrDetail
  onClose: () => void
}

function RejectNcrForm({ ncr, onClose }: RejectNcrFormProps) {
  const queryClient = useQueryClient()
  const rejectNcrFn = useServerFn(rejectNcr)

  const mutation = useMutation({
    mutationFn: (reason: string) =>
      rejectNcrFn({ data: { ncrId: ncr.id, reason } }),
    onSuccess: async () => {
      onClose()
      await queryClient.invalidateQueries({ queryKey: ["ncrs"] })
    },
  })

  const form = useAppForm({
    defaultValues: { reason: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: rejectNcrSchema.pick({ reason: true }) },
    onSubmit: ({ value }) => mutation.mutate(value.reason),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <DialogHeader className="gap-1">
        <DialogTitle className="flex items-center gap-2 text-base font-medium">
          <CircleX className="size-4 text-destructive" />
          Không duyệt NCR {ncr.code}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          NCR quay lại trạng thái "Không duyệt" để người phụ trách sửa phương án
          rồi gửi duyệt lại.
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="reason">
        {(field) => (
          <field.TextareaField
            label="Lý do không duyệt"
            required
            placeholder="Nhập lý do không duyệt"
          />
        )}
      </form.AppField>

      {mutation.error && (
        <p className="text-sm text-destructive">{mutation.error.message}</p>
      )}

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={mutation.isPending}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          variant="destructive"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Đang xử lý..." : "Không duyệt"}
        </Button>
      </DialogFooter>
    </form>
  )
}
