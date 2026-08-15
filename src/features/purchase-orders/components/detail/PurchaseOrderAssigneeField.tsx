import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import { ComboboxField } from "@/components/shared/ComboboxField"
import { updatePurchaseOrder } from "@/features/purchase-orders/api/server-functions/update-purchase-order.api"
import { useGetUserOptions } from "@/features/purchase-orders/hooks/use-get-user-options"
import type { PurchaseOrderUserRef } from "@/lib/types/purchase-order.type"

type PurchaseOrderAssigneeFieldProps = {
  purchaseOrderId: string
  assignedUser: PurchaseOrderUserRef | null
  editable: boolean
}

// Mirror PurchaseOrderExpectedDateField.tsx's shape (own mutation, commit on change) — the one
// header field that needs search, so it uses ComboboxField + useGetUserOptions instead of a
// plain <Select>.
export function PurchaseOrderAssigneeField({
  purchaseOrderId,
  assignedUser,
  editable,
}: PurchaseOrderAssigneeFieldProps) {
  const queryClient = useQueryClient()
  const updatePurchaseOrderFn = useServerFn(updatePurchaseOrder)
  const [value, setValue] = useState(assignedUser?.id)
  const user = useGetUserOptions()

  const { mutate: save } = useMutation({
    mutationFn: (assignedUserId: string | null) =>
      updatePurchaseOrderFn({ data: { purchaseOrderId, assignedUserId } }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
    onError: (error) => {
      toast.error(error.message)
      setValue(assignedUser?.id)
    },
  })

  if (!editable) {
    return (
      <div className="min-w-0 space-y-1">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Người phụ trách
        </p>
        <p className="truncate text-sm font-medium text-foreground">
          {assignedUser?.fullName ?? "Chưa gán"}
        </p>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-1">
      <label
        htmlFor="purchase-order-assignee"
        className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
      >
        Người phụ trách <span className="text-destructive">*</span>
      </label>
      <ComboboxField
        id="purchase-order-assignee"
        placeholder="Chọn người phụ trách"
        value={value}
        onValueChange={(nextValue) => {
          setValue(nextValue)
          save(nextValue ?? null)
        }}
        options={user.options}
        onSearchChange={user.onSearchChange}
        isPending={user.isFetching}
        initialOption={
          assignedUser
            ? { value: assignedUser.id, label: assignedUser.fullName }
            : undefined
        }
        emptyMessage="Không tìm thấy nhân viên"
      />
    </div>
  )
}
