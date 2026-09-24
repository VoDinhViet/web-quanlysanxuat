import { useState } from "react"
import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Copy } from "lucide-react"
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
import { copyConsumable } from "@/features/consumables/api/server-functions/copy-consumable.api"
import { copyConsumableSchema } from "@/features/consumables/schemas/copy-consumable.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type { Consumable } from "@/lib/types/consumable.type"

type CopyConsumableDialogProps = {
  consumable: Consumable
  trigger: ReactElement
}

// A consumable copy needs a new `code` (codes are user-entered and unique), so the dialog carries
// a form — unlike the product copy, which keeps the code and only bumps the revision.
export function CopyConsumableDialog({
  consumable,
  trigger,
}: CopyConsumableDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <CopyConsumableForm
          consumable={consumable}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type CopyConsumableFormProps = {
  consumable: Consumable
  onClose: () => void
}

function CopyConsumableForm({ consumable, onClose }: CopyConsumableFormProps) {
  const queryClient = useQueryClient()
  const copyConsumableFn = useServerFn(copyConsumable)

  const mutation = useMutation({
    mutationFn: (value: { code: string; name: string }) =>
      copyConsumableFn({ data: { itemId: consumable.id, ...value } }),
    onSuccess: async (_data, value) => {
      onClose()
      toast.success(`Đã sao chép thành vật tư ${value.code}`)
      await queryClient.invalidateQueries({ queryKey: ["consumables"] })
    },
  })

  const form = useAppForm({
    defaultValues: { code: "", name: consumable.name },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: copyConsumableSchema.pick({ code: true, name: true }),
    },
    onSubmit: ({ value }) => mutation.mutate(value),
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
        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
          <Copy className="size-4 text-primary" />
          Sao chép vật tư này?
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          {`Tạo vật tư mới từ "${consumable.name}" (${consumable.code}), giữ nguyên đơn vị, nhà cung cấp, thông tin mở rộng, ảnh và tài liệu. Bạn có thể sửa lại sau khi tạo.`}
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="code">
        {(field) => (
          <field.TextField
            label="Mã vật tư mới"
            required
            placeholder="Nhập mã vật tư mới"
          />
        )}
      </form.AppField>

      <form.AppField name="name">
        {(field) => <field.TextField label="Tên vật tư" required />}
      </form.AppField>

      {mutation.error ? (
        <p className="text-sm text-destructive">{mutation.error.message}</p>
      ) : null}

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={mutation.isPending}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Đang xử lý..." : "Xác nhận"}
        </Button>
      </DialogFooter>
    </form>
  )
}
