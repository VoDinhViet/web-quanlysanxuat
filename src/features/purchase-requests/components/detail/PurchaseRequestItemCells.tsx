import { useParams } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { NumericFormat } from "react-number-format"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { updatePurchaseRequestItem } from "@/features/purchase-requests/api/server-functions/update-purchase-request-item.api"
import { DeletePurchaseRequestItemDialog } from "@/features/purchase-requests/components/detail/DeletePurchaseRequestItemDialog"
import { PurchaseRequestItemNoteDialog } from "@/features/purchase-requests/components/detail/PurchaseRequestItemNoteDialog"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type PurchaseRequestItemQuantityCellProps = {
  purchaseRequestItemId: string
  itemName: string
  quantity: number
  editable: boolean
}

// A real write to the backend (PATCH .../items/:id, same route the note dialog uses) — lưu khi
// blur, không lưu theo từng phím gõ, để tránh spam request. `purchaseRequestId` is a route param,
// read directly via `useParams` rather than threaded down through Section → columns factory.
export function PurchaseRequestItemQuantityCell({
  purchaseRequestItemId,
  itemName,
  quantity,
  editable,
}: PurchaseRequestItemQuantityCellProps) {
  const { purchaseRequestId } = useParams({
    from: "/(authed)/manage_/purchase-requests_/$purchaseRequestId",
  })
  const queryClient = useQueryClient()
  const updateItemFn = useServerFn(updatePurchaseRequestItem)
  const [value, setValue] = useState(quantity)

  const { mutate: save, isPending } = useMutation({
    mutationFn: (nextQuantity: number) =>
      updateItemFn({
        data: {
          purchaseRequestId,
          purchaseRequestItemId,
          quantity: nextQuantity,
        },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] }),
    onError: (error) => {
      toast.error(error.message)
      setValue(quantity)
    },
  })

  if (!editable) {
    return (
      <span className="block text-right tabular-nums">
        {quantityFormatter.format(quantity)}
      </span>
    )
  }

  return (
    <NumericFormat
      customInput={Input}
      className="h-8 w-24 text-right text-xs tabular-nums"
      value={value}
      thousandSeparator="."
      decimalSeparator=","
      allowNegative={false}
      disabled={isPending}
      onValueChange={(values) => setValue(values.floatValue ?? 0)}
      onBlur={() => {
        if (value === quantity) return

        if (!(value > 0)) {
          toast.error("SL đề xuất phải lớn hơn 0.")
          setValue(quantity)
          return
        }

        save(value)
      }}
      aria-label={`SL đề xuất cho ${itemName}`}
    />
  )
}

type PurchaseRequestItemNoteCellProps = {
  purchaseRequestItemId: string
  itemName: string
  note: string | null
  editable: boolean
}

// A dialog (TanStack Form) instead of an inline input — this is a real write to the backend
// (PATCH .../items/:id), so it gets the same form+mutation treatment as any other entity edit
// dialog in the repo (see PurchaseRequestItemNoteDialog.tsx — it reads `purchaseRequestId` off
// the route itself via `useParams`, so it isn't threaded through this cell). `editable` is
// computed once at the page level (permission + phiếu đang DRAFT) and applied the same way to
// every row.
export function PurchaseRequestItemNoteCell({
  purchaseRequestItemId,
  itemName,
  note,
  editable,
}: PurchaseRequestItemNoteCellProps) {
  if (!editable) {
    return (
      <span className="block max-w-40 truncate text-muted-foreground">
        {note ?? "—"}
      </span>
    )
  }

  return (
    <div className="flex max-w-40 items-center gap-1.5">
      <span className="min-w-0 flex-1 truncate text-muted-foreground">
        {note ?? "—"}
      </span>
      <PurchaseRequestItemNoteDialog
        purchaseRequestItemId={purchaseRequestItemId}
        itemName={itemName}
        note={note}
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={`Sửa ghi chú cho ${itemName}`}
          >
            <Pencil className="size-3.5" />
          </Button>
        }
      />
    </div>
  )
}

type PurchaseRequestItemActionsCellProps = {
  purchaseRequestItemId: string
  itemName: string
  itemCode: string
  editable: boolean
  isLastItem: boolean
}

export function PurchaseRequestItemActionsCell({
  purchaseRequestItemId,
  itemName,
  itemCode,
  editable,
  isLastItem,
}: PurchaseRequestItemActionsCellProps) {
  if (!editable) {
    return null
  }

  const removeButton = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
      aria-label={`Xóa ${itemName} khỏi đề xuất`}
      disabled={isLastItem}
    >
      <Trash2 className="size-3.5" />
      Xóa
    </Button>
  )

  if (isLastItem) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Disabled button swallows pointer events — the wrapper is what the tooltip
              actually attaches to (see DisabledAction.tsx for the same trick). */}
          <span tabIndex={0}>{removeButton}</span>
        </TooltipTrigger>
        <TooltipContent>Đề xuất phải còn ít nhất 1 dòng vật tư</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <DeletePurchaseRequestItemDialog
      purchaseRequestItemId={purchaseRequestItemId}
      itemName={itemName}
      itemCode={itemCode}
      trigger={removeButton}
    />
  )
}
