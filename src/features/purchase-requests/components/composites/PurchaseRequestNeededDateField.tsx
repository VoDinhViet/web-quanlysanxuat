import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DateTime } from "luxon"
import { useState } from "react"
import { toast } from "sonner"

import { DatePicker } from "@/components/shared/composites/DatePicker"
import { updatePurchaseRequestNeededDate } from "@/features/purchase-requests/api/server-functions/update-purchase-request-needed-date.api"
import { useHasPermission } from "@/hooks/use-permissions"
import { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"

type PurchaseRequestNeededDateFieldProps = {
  purchaseRequestId: string
  neededDate: string
  status: PurchaseRequestStatus
}

// Đề xuất tự sinh từ Job có ngày cần mặc định = ngày tạo — người dùng phải tự chọn lại ngày cần thật
// (bắt buộc, không xoá trống được) khi còn Nháp/Bị từ chối (cùng cửa với sửa dòng vật tư). Lưu ngay
// khi chọn ngày (ô chọn ngày không có rủi ro mất focus như ô gõ).
export function PurchaseRequestNeededDateField({
  purchaseRequestId,
  neededDate,
  status,
}: PurchaseRequestNeededDateFieldProps) {
  const canUpdate = useHasPermission("purchase-requests:update")
  const editable =
    canUpdate &&
    (status === PurchaseRequestStatus.DRAFT ||
      status === PurchaseRequestStatus.REJECTED)
  const queryClient = useQueryClient()
  const updateNeededDateFn = useServerFn(updatePurchaseRequestNeededDate)
  const serverValue = DateTime.fromISO(neededDate, { zone: "utc" }).toFormat(
    "yyyy-MM-dd"
  )
  const [value, setValue] = useState(serverValue)
  const [syncedValue, setSyncedValue] = useState(serverValue)
  if (serverValue !== syncedValue) {
    setSyncedValue(serverValue)
    setValue(serverValue)
  }

  const { mutate: save } = useMutation({
    mutationFn: (nextNeededDate: string) =>
      updateNeededDateFn({
        data: { purchaseRequestId, neededDate: nextNeededDate },
      }),
    onSuccess: async () => {
      toast.success("Đã lưu ngày cần")
      await queryClient.invalidateQueries({ queryKey: ["purchase-requests"] })
    },
    onError: (error) => {
      toast.error(error.message)
      setValue(serverValue)
    },
  })

  if (!editable) {
    return (
      <div className="min-w-0 space-y-1">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Ngày cần
        </p>
        <p className="truncate text-sm font-medium text-foreground">
          {DateTime.fromISO(neededDate, { zone: "utc" }).toFormat("dd/MM/yyyy")}
        </p>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-1">
      <label className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        Ngày cần <span className="text-destructive">*</span>
      </label>
      <DatePicker
        value={value}
        onChange={(nextValue) => {
          setValue(nextValue)
          if (nextValue.length > 0 && nextValue !== serverValue) save(nextValue)
        }}
      />
    </div>
  )
}
