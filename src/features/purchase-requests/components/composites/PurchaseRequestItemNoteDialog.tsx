import { useParams } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAppForm } from "@/hooks/use-app-form"
import { updatePurchaseRequestItem } from "@/features/purchase-requests/api/server-functions/update-purchase-request-item.api"
import { updatePurchaseRequestItemNoteSchema } from "@/features/purchase-requests/schemas/update-purchase-request-item-note.schema"

type PurchaseRequestItemNoteDialogProps = {
  purchaseRequestItemId: string
  itemName: string
  note: string | null
  trigger: ReactNode
}

export function PurchaseRequestItemNoteDialog({
  purchaseRequestItemId,
  itemName,
  note,
  trigger,
}: PurchaseRequestItemNoteDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      {trigger}
      <Dialog className="shadow-lg ring-0 sm:max-w-md">
        {/* The dialog unmounts content while closed, so this form re-mounts on each
            open and its state seeds fresh from `note`. */}
        <PurchaseRequestItemNoteDialogForm
          purchaseRequestItemId={purchaseRequestItemId}
          itemName={itemName}
          note={note}
          onClose={() => setOpen(false)}
        />
      </Dialog>
    </DialogTrigger>
  )
}

type PurchaseRequestItemNoteDialogFormProps = {
  purchaseRequestItemId: string
  itemName: string
  note: string | null
  onClose: () => void
}

function PurchaseRequestItemNoteDialogForm({
  purchaseRequestItemId,
  itemName,
  note,
  onClose,
}: PurchaseRequestItemNoteDialogFormProps) {
  // `purchaseRequestId` is a route param, not per-row data — read it directly instead of
  // threading it down through Page → Section → columns factory → this cell's whole call chain.
  const { purchaseRequestId } = useParams({
    from: "/(authed)/manage_/purchase-requests_/$purchaseRequestId",
  })
  const queryClient = useQueryClient()
  const updateItemFn = useServerFn(updatePurchaseRequestItem)

  const { mutate: save, isPending } = useMutation({
    mutationFn: (nextNote: string | null) =>
      updateItemFn({
        data: { purchaseRequestId, purchaseRequestItemId, note: nextNote },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["purchase-requests"] })
      onClose()
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: { note: note ?? "" },
    validators: { onSubmit: updatePurchaseRequestItemNoteSchema },
    onSubmit: ({ value }) => save(value.note.length > 0 ? value.note : null),
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
        <DialogTitle className="text-base font-semibold">
          Ghi chú vật tư
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          {itemName}
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="note">
        {(field) => (
          <field.TextareaField
            label="Ghi chú"
            placeholder="Nhập ghi chú (nếu có)"
          />
        )}
      </form.AppField>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          isDisabled={isPending}
          onPress={onClose}
        >
          Hủy
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              isDisabled={!canSubmit || isSubmitting || isPending}
            >
              {isSubmitting || isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Lưu
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  )
}
