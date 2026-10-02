import { useServerFn } from "@tanstack/react-start"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useDebounceValue } from "usehooks-ts"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { currentUserQueryOptions } from "@/features/auth/api"
import { updatePurchaseOrder } from "@/features/purchase-orders/api/server-functions/update-purchase-order.api"
import { usersQueryOptions } from "@/features/users/api"
import type { PurchaseOrderUserRef } from "@/lib/types/purchase-order.type"

type UserOption = {
  value: string
  label: string
}

type PurchaseOrderAssigneeProps = {
  purchaseOrderId: string
  assignedUser: PurchaseOrderUserRef | null
  editable: boolean
}

export function PurchaseOrderAssignee({
  purchaseOrderId,
  assignedUser,
  editable,
}: PurchaseOrderAssigneeProps) {
  const queryClient = useQueryClient()
  const updatePurchaseOrderFn = useServerFn(updatePurchaseOrder)
  const { data: profile } = useQuery(currentUserQueryOptions)

  const [page, setPage] = useState(1)
  const [q, setQ] = useState("")
  const [debouncedQ] = useDebounceValue(q, 300)

  // Gọi trực tiếp API người dùng có phân trang (usersQueryOptions) thay vì useGetUserOptions
  const { data: usersData, isFetching } = useQuery({
    ...usersQueryOptions({
      page,
      limit: 20,
      q: debouncedQ.trim() || undefined,
      status: "WORKING",
    }),
    placeholderData: keepPreviousData,
  })

  const pagination = usersData?.pagination
  const userOptions = useMemo<UserOption[]>(
    () =>
      (usersData?.data ?? []).map((u) => ({
        value: u.id,
        label: u.fullName,
      })),
    [usersData?.data]
  )

  const defaultOption: UserOption | null = useMemo(() => {
    if (assignedUser) {
      return { value: assignedUser.id, label: assignedUser.fullName }
    }
    if (profile?.userId) {
      return {
        value: profile.userId,
        label: profile.fullName ?? profile.username,
      }
    }
    return null
  }, [assignedUser, profile])

  const [selected, setSelected] = useState<UserOption | null>(defaultOption)

  // Đồng bộ lại selected khi assignedUser hoặc profile thay đổi
  useEffect(() => {
    if (defaultOption) {
      setSelected(defaultOption)
    }
  }, [defaultOption])

  const { mutate: save } = useMutation({
    mutationFn: (assignedUserId: string | null) =>
      updatePurchaseOrderFn({ data: { purchaseOrderId, assignedUserId } }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
    onError: (error) => {
      toast.error(error.message)
      setSelected(defaultOption)
    },
  })

  // Đơn mua chưa có người phụ trách: mặc định gán theo user đăng nhập
  useEffect(() => {
    if (editable && !assignedUser && profile?.userId) {
      save(profile.userId)
    }
  }, [editable, assignedUser, profile?.userId, save])

  if (!editable) {
    return (
      <div className="min-w-0 space-y-1">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Người phụ trách
        </p>
        <p className="truncate text-sm font-medium text-foreground">
          {assignedUser?.fullName ??
            profile?.fullName ??
            profile?.username ??
            "—"}
        </p>
      </div>
    )
  }

  const items =
    selected && !userOptions.some((o) => o.value === selected.value)
      ? [selected, ...userOptions]
      : userOptions

  return (
    <div className="min-w-0 space-y-1">
      <label
        htmlFor="purchase-order-assignee"
        className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
      >
        Người phụ trách
      </label>
      <Combobox
        items={items}
        value={selected}
        onValueChange={(next) => {
          setSelected(next)
          save(next ? next.value : null)
        }}
        isItemEqualToValue={(itemValue, current) =>
          itemValue?.value === current?.value
        }
        onInputValueChange={(query) => {
          setQ(query)
          setPage(1)
        }}
      >
        <ComboboxInput
          id="purchase-order-assignee"
          placeholder="Chọn người phụ trách"
          className="h-9 w-full bg-background text-xs"
        />
        <ComboboxContent>
          <ComboboxEmpty>
            {isFetching ? "Đang tìm..." : "Không tìm thấy nhân viên"}
          </ComboboxEmpty>
          <ComboboxList>
            {items.map((option) => (
              <ComboboxItem key={option.value} value={option}>
                {option.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
          {pagination && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-border/60 px-2 py-1.5 text-xs text-muted-foreground">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                disabled={page <= 1 || isFetching}
                onClick={(e) => {
                  e.preventDefault()
                  setPage((p) => Math.max(1, p - 1))
                }}
              >
                Trước
              </Button>
              <span className="text-[11px]">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                disabled={page >= pagination.totalPages || isFetching}
                onClick={(e) => {
                  e.preventDefault()
                  setPage((p) => p + 1)
                }}
              >
                Sau
              </Button>
            </div>
          ) : null}
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
