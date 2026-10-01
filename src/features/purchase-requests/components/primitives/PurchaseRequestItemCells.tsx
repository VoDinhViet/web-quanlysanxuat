import { useParams } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Image } from "@unpic/react"
import { Gallery } from "@solar-icons/react"
import { Ban, Loader2, Pencil, ShoppingCart, Trash2 } from "lucide-react"
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
import { resolveFileUrl } from "@/lib/file-url"
import type { FileResource } from "@/lib/types/file.type"
import { updatePurchaseRequestItem } from "@/features/purchase-requests/api/server-functions/update-purchase-request-item.api"
import { DeletePurchaseRequestItemDialog } from "@/features/purchase-requests/components/composites/DeletePurchaseRequestItemDialog"
import { PurchaseRequestItemNoteDialog } from "@/features/purchase-requests/components/composites/PurchaseRequestItemNoteDialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { updatePurchaseRequestItemPurchasable } from "@/features/purchase-requests/api/server-functions/update-purchase-request-item-purchasable.api"
import { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"

export function PurchaseRequestItemImageCell({
  image,
  name,
}: {
  image?: FileResource | { url: string } | null
  name?: string
}) {
  const imageUrl = image ? resolveFileUrl(image.url) : null

  return (
    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name ?? "Vật tư"}
          layout="fullWidth"
          objectFit="cover"
          className="size-full"
        />
      ) : (
        <Gallery className="size-4 text-muted-foreground/50" />
      )}
    </div>
  )
}

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

const purchasableOptions = [
  { value: "true", label: "Mua" },
  { value: "false", label: "Không mua" },
]

type PurchaseRequestItemPurchasableSelectProps = {
  purchaseRequestItemId: string
  itemName: string
  requiresPurchase: boolean
  canUpdate: boolean
}

export function PurchaseRequestItemPurchasableSelect({
  purchaseRequestItemId,
  itemName,
  requiresPurchase,
  canUpdate,
}: PurchaseRequestItemPurchasableSelectProps) {
  const { purchaseRequestId } = useParams({
    from: "/(authed)/manage_/purchase-requests_/$purchaseRequestId",
  })
  const queryClient = useQueryClient()
  const updatePurchasableFn = useServerFn(updatePurchaseRequestItemPurchasable)

  const [pendingRequiresPurchase, setPendingRequiresPurchase] = useState<
    boolean | null
  >(null)
  const currentRequiresPurchase = pendingRequiresPurchase ?? requiresPurchase

  const { mutate: updateRequiresPurchase, isPending } = useMutation({
    mutationFn: (nextRequiresPurchase: boolean) => {
      setPendingRequiresPurchase(nextRequiresPurchase)
      return updatePurchasableFn({
        data: {
          purchaseRequestId,
          purchaseRequestItemId,
          requiresPurchase: nextRequiresPurchase,
        },
      })
    },
    onSuccess: async (_data, nextRequiresPurchase) => {
      await queryClient.invalidateQueries({ queryKey: ["purchase-requests"] })
      toast.success(
        nextRequiresPurchase
          ? `Đã chuyển sang mua vật tư "${itemName}"`
          : `Đã chuyển sang không mua vật tư "${itemName}"`
      )
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSettled: () => setPendingRequiresPurchase(null),
  })

  const select = (
    <Select
      items={purchasableOptions}
      value={currentRequiresPurchase ? "true" : "false"}
      onValueChange={(val) =>
        val !== null && updateRequiresPurchase(val === "true")
      }
      disabled={isPending}
    >
      <SelectTrigger
        size="sm"
        className={cn(
          "h-8 w-28 rounded-md px-2.5 text-xs font-medium shadow-none transition-all duration-150 justify-between",
          currentRequiresPurchase
            ? "border-emerald-200/90 bg-emerald-50/90 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100/90 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 [&_svg:last-child]:text-emerald-600/70 dark:[&_svg:last-child]:text-emerald-400/70"
            : "border-border/80 bg-muted/50 text-muted-foreground hover:border-border hover:bg-muted/90 hover:text-foreground dark:border-border/60 dark:bg-muted/30 dark:hover:bg-muted/60 [&_svg:last-child]:text-muted-foreground/70"
        )}
        aria-label={`Trạng thái mua hàng của ${itemName}`}
      >
        <SelectValue>
          {(selected: { value: string; label: string } | string | null) => {
            const val =
              typeof selected === "object" && selected !== null
                ? selected.value
                : selected
            const isPurchase = val !== "false"
            return (
              <span className="flex items-center gap-1.5 font-medium">
                {isPending ? (
                  <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
                ) : isPurchase ? (
                  <ShoppingCart className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Ban className="size-3.5 shrink-0 text-muted-foreground/70" />
                )}
                <span className="truncate">{isPurchase ? "Mua" : "Không mua"}</span>
              </span>
            )
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="center" className="min-w-44 p-1">
        <SelectItem value="true" className="cursor-pointer py-1.5">
          <span className="flex items-center gap-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <ShoppingCart className="size-3" />
            </span>
            <span className="flex flex-col text-left">
              <span className="text-xs font-medium text-foreground">Mua</span>
              <span className="text-[10px] text-muted-foreground">Cần mua cho đề xuất</span>
            </span>
          </span>
        </SelectItem>
        <SelectItem value="false" className="cursor-pointer py-1.5">
          <span className="flex items-center gap-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Ban className="size-3" />
            </span>
            <span className="flex flex-col text-left">
              <span className="text-xs font-medium text-foreground">Không mua</span>
              <span className="text-[10px] text-muted-foreground">Bỏ qua vật tư này</span>
            </span>
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )

  if (!canUpdate) {
    return (
      <div className="flex items-center justify-center">
        <Tooltip>
          <TooltipTrigger
            render={
              <span
                tabIndex={0}
                className={cn(
                  "inline-flex h-8 w-28 cursor-not-allowed items-center justify-between gap-1.5 rounded-md border px-2.5 text-xs font-medium shadow-none select-none opacity-80",
                  requiresPurchase
                    ? "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-border/80 bg-muted/60 text-muted-foreground dark:border-border/60 dark:bg-muted/30"
                )}
              >
                <span className="flex items-center gap-1.5">
                  {requiresPurchase ? (
                    <ShoppingCart className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Ban className="size-3.5 shrink-0 text-muted-foreground/70" />
                  )}
                  <span>{requiresPurchase ? "Mua" : "Không mua"}</span>
                </span>
              </span>
            }
          />
          <TooltipContent>Bạn không có quyền sửa đề xuất mua hàng</TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return <div className="flex items-center justify-center">{select}</div>
}

type PurchaseRequestItemActionsCellProps = {
  purchaseRequestItemId: string
  itemName: string
  itemCode: string
  requiresPurchase?: boolean
  status: PurchaseRequestStatus
  canUpdate: boolean
  isLastItem: boolean
}

export function PurchaseRequestItemActionsCell({
  purchaseRequestItemId,
  itemName,
  itemCode,
  requiresPurchase = true,
  status,
  canUpdate,
  isLastItem,
}: PurchaseRequestItemActionsCellProps) {
  // Chỉ trạng thái nháp mới hiển thị nút xóa
  if (status === PurchaseRequestStatus.DRAFT) {
    if (!canUpdate) {
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
      // Disabled button swallows pointer events — the wrapper is what the tooltip
      // actually attaches to (see DisabledAction.tsx for the same trick).
      return (
        <Tooltip>
          <TooltipTrigger render={<span tabIndex={0}>{removeButton}</span>} />
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

  // Các trạng thái còn lại (sau khi duyệt xong) chuyển sang đánh dấu mua / không mua
  return (
    <PurchaseRequestItemPurchasableSelect
      purchaseRequestItemId={purchaseRequestItemId}
      itemName={itemName}
      requiresPurchase={requiresPurchase}
      canUpdate={canUpdate}
    />
  )
}

