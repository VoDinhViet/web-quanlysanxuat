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
import { copyDirect } from "@/features/directs/api/server-functions/copy-direct.api"
import { copyDirectSchema } from "@/features/directs/schemas/copy-direct.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type { Direct } from "@/lib/types/direct.type"

type CopyDirectDialogProps = {
  direct: Direct
  trigger: ReactElement
}

// A direct copy needs a new `code` (codes are user-entered and unique), so the dialog carries
// a form — unlike the product copy, which keeps the code and only bumps the revision.
export function CopyDirectDialog({ direct, trigger }: CopyDirectDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <CopyDirectForm direct={direct} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

type CopyDirectFormProps = {
  direct: Direct
  onClose: () => void
}

function CopyDirectForm({ direct, onClose }: CopyDirectFormProps) {
  const queryClient = useQueryClient()
  const copyDirectFn = useServerFn(copyDirect)

  const mutation = useMutation({
    mutationFn: (value: { code: string; name: string }) =>
      copyDirectFn({ data: { itemId: direct.id, ...value } }),
    onSuccess: async (_data, value) => {
      onClose()
      toast.success(`Đã sao chép thành vật tư ${value.code}`)
      await queryClient.invalidateQueries({ queryKey: ["directs"] })
    },
  })

  const form = useAppForm({
    defaultValues: { code: "", name: direct.name },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: copyDirectSchema.pick({ code: true, name: true }),
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
          {`Tạo vật tư mới từ "${direct.name}" (${direct.code}), giữ nguyên đơn vị, nhà cung cấp, thông tin mở rộng, ảnh và tài liệu. Bạn có thể sửa lại sau khi tạo.`}
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
