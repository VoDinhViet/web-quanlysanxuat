import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
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
import { copyItem } from "@/features/products/api/server-functions/copy-item.api"
import { copyProductSchema } from "@/features/products/schemas/copy-product.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type { Item } from "@/lib/types/item.type"

type CopyProductDialogProps = {
  product: Item
  trigger: ReactElement
}

// A copy keeps the source's `code` — only the `revision` differs, so the dialog needs an
// input (AlertDialog can't hold a form field, hence a plain Dialog here).
export function CopyProductDialog({
  product,
  trigger,
}: CopyProductDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        {/* The dialog unmounts content while closed, so the form (and its mutation state)
            re-mounts fresh — the suggested revision is recomputed each time it opens. */}
        <CopyProductForm product={product} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

// Bumps a trailing number so the dialog can prefill something more useful than an empty
// box — "R01" → "R02", "v1.9" → "v1.10". Falls back to "" (no default) when the revision
// carries no trailing digits to bump, e.g. "A"; the user just types the next one themselves.
function suggestNextRevision(revision: string): string {
  const match = /^(.*?)(\d+)$/.exec(revision)

  if (!match) return ""

  const [, prefix, digits] = match
  const next = String(Number(digits) + 1).padStart(digits.length, "0")

  return `${prefix}${next}`
}

type CopyProductFormProps = {
  product: Item
  onClose: () => void
}

function CopyProductForm({ product, onClose }: CopyProductFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const copyItemFn = useServerFn(copyItem)

  const mutation = useMutation({
    mutationFn: (revision: string) =>
      copyItemFn({ data: { itemId: product.id, revision } }),
    // `revision` here is the variable passed to `mutate`, not a re-read of form
    // state — the dialog is about to unmount, so the toast can't rely on it.
    onSuccess: async (_data, revision) => {
      onClose()
      toast.success(`Đã nhân bản thành ${product.code} · ${revision}`)
      await queryClient.invalidateQueries({ queryKey: ["items"] })
      await navigate({
        to: "/manage/products",
        search: { page: 1, limit: 10, q: product.code },
      })
    },
  })

  const form = useAppForm({
    defaultValues: { revision: suggestNextRevision(product.revision) },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: copyProductSchema.pick({ revision: true }),
    },
    onSubmit: ({ value }) => mutation.mutate(value.revision),
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
          Nhân bản sản phẩm này?
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          {`Tạo một bản sao của "${product.name}" (${product.code}), giữ nguyên mã và chỉ khác phiên bản. Bạn sẽ được chuyển tới danh sách sản phẩm ngay sau đó.`}
        </DialogDescription>
      </DialogHeader>

      <form.AppField name="revision">
        {(field) => (
          <field.TextField
            label="Phiên bản"
            required
            placeholder="Ví dụ: R02"
          />
        )}
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
