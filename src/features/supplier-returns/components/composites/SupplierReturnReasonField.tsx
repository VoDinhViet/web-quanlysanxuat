import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateSupplierReturn } from "@/features/supplier-returns/api/server-functions/update-supplier-return.api"

type SupplierReturnReasonFieldProps = {
  supplierReturnId: string
  returnReason: string | null
  editable: boolean
}

export function SupplierReturnReasonField({
  supplierReturnId,
  returnReason,
  editable,
}: SupplierReturnReasonFieldProps) {
  const queryClient = useQueryClient()
  const updateSupplierReturnFn = useServerFn(updateSupplierReturn)

  const [localValue, setLocalValue] = useState(returnReason ?? "")
  const [syncedValue, setSyncedValue] = useState(returnReason ?? "")

  if ((returnReason ?? "") !== syncedValue) {
    setSyncedValue(returnReason ?? "")
    setLocalValue(returnReason ?? "")
  }

  const { mutate: save, isPending } = useMutation({
    mutationFn: (nextReason: string) =>
      updateSupplierReturnFn({
        data: {
          supplierReturnId,
          returnReason: nextReason.trim() || null,
        },
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["supplier-returns"] }),
        queryClient.invalidateQueries({ queryKey: ["iqc"] }),
      ])
      toast.success("Đã cập nhật lý do trả hàng")
    },
    onError: (error) => {
      toast.error(error.message)
      setLocalValue(returnReason ?? "")
    },
  })

  const hasChanged = localValue.trim() !== (returnReason ?? "").trim()

  const handleBlur = () => {
    if (!hasChanged || isPending) return
    save(localValue)
  }

  if (!editable) {
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Lý do trả
        </p>
        <p className="text-sm whitespace-pre-wrap text-foreground">
          {returnReason ?? "—"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="supplier-return-reason"
          className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
        >
          Lý do trả
        </label>
        {isPending && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Đang lưu…
          </span>
        )}
      </div>

      <div className="relative">
        <Textarea
          id="supplier-return-reason"
          className="min-h-20 resize-y bg-background text-sm leading-relaxed"
          placeholder="Nhập lý do trả hàng (tự động lưu khi bấm ra ngoài)"
          value={localValue}
          maxLength={1000}
          disabled={isPending}
          onChange={(event) => setLocalValue(event.target.value)}
          onBlur={handleBlur}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault()
              if (hasChanged && !isPending) {
                save(localValue)
              }
            }
          }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Tự động lưu khi bấm ra ngoài hoặc nhấn nút Lưu</span>
        {hasChanged && (
          <Button
            type="button"
            size="xs"
            disabled={isPending}
            onClick={() => save(localValue)}
            className="gap-1"
          >
            {isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Check className="size-3" />
            )}
            Lưu
          </Button>
        )}
      </div>
    </div>
  )
}
