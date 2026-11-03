import { useEffect, useRef, useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, Loader2, Pencil, X } from "lucide-react"
import { toast } from "sonner"
import type { KeyboardEvent, SubmitEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { updateOrderBuyerPo } from "@/features/orders/api/server-functions/update-order-buyer-po.api"
import { updateOrderBuyerPoSchema } from "@/features/orders/schemas/update-order-buyer-po.schema"
import { canUpdateOrderBuyerPo } from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"

// Every screen below prints the PO it reads through the order, and each keeps its own cache.
const BUYER_PO_QUERY_ROOTS = [
  "orders",
  "production-orders",
  "production-jobs",
  "production-execution",
  "oqc",
  "outbound-orders",
  "inventory-receipts",
  "inventory-issues",
  "inventory-requisitions",
  "purchase-requests",
  "purchase-ledger",
  "ncrs",
] as const

type OrderBuyerPoInlineEditProps = {
  order: Pick<OrderDetail, "id" | "status" | "buyerPoNo">
}

// The PO row of the order info card: the value with a button that turns it into an input in
// place. Only the PO is written (PATCH /orders/:orderId/buyer-po), so it also works on an approved
// order where the full edit form is closed.
export function OrderBuyerPoInlineEdit({ order }: OrderBuyerPoInlineEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const updateOrderBuyerPoFn = useServerFn(updateOrderBuyerPo)

  const mutation = useMutation({
    mutationFn: (buyerPoNo: string) =>
      updateOrderBuyerPoFn({ data: { orderId: order.id, buyerPoNo } }),
    // Refetch before closing so the card never shows the old PO next to a success toast; the
    // mutation stays pending meanwhile, which keeps the input disabled and the spinner on.
    onSuccess: async () => {
      await Promise.all(
        BUYER_PO_QUERY_ROOTS.map((queryRoot) =>
          queryClient.invalidateQueries({ queryKey: [queryRoot] })
        )
      )
      setIsEditing(false)
      toast.success("Đã cập nhật số PO")
    },
    onError: (error) => setErrorMessage(error.message),
  })

  useEffect(() => {
    if (!isEditing) return
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [isEditing])

  const startEditing = () => {
    setDraft(order.buyerPoNo ?? "")
    setErrorMessage(null)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setErrorMessage(null)
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mutation.isPending) return

    const parsed = updateOrderBuyerPoSchema.shape.buyerPoNo.safeParse(draft)
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0].message)
      return
    }
    if (parsed.data === order.buyerPoNo) {
      cancelEditing()
      return
    }
    setErrorMessage(null)
    mutation.mutate(parsed.data)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") cancelEditing()
  }

  if (!isEditing) {
    return (
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate">{order.buyerPoNo ?? "--"}</span>
        {canUpdateOrderBuyerPo(order.status) && (
          <PermissionGate permission="orders:update">
            <Button
              type="button"
              size="xs"
              aria-label="Sửa số PO"
              onClick={startEditing}
            >
              <Pencil />
              Sửa
            </Button>
          </PermissionGate>
        )}
      </span>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-1">
      <InputGroup className="h-9">
        <InputGroupInput
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={mutation.isPending}
          aria-label="Số PO"
          aria-invalid={errorMessage !== null}
          placeholder="Nhập số PO của khách hàng"
          className="text-sm"
        />
        <InputGroupAddon align="inline-end" className="gap-1">
          <InputGroupButton
            variant="ghost"
            size="icon-xs"
            aria-label="Hủy sửa số PO"
            onClick={cancelEditing}
            disabled={mutation.isPending}
          >
            <X />
          </InputGroupButton>
          <InputGroupButton
            type="submit"
            variant="default"
            size="icon-xs"
            aria-label="Lưu số PO"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Check />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {errorMessage ? (
        <p className="text-xs font-normal text-destructive">{errorMessage}</p>
      ) : (
        <p className="text-xs font-normal text-muted-foreground">
          Enter để lưu · Esc để hủy
        </p>
      )}
    </form>
  )
}
