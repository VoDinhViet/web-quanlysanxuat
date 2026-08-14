import { useQuery } from "@tanstack/react-query"
import { DateTime } from "luxon"

import { withForm } from "@/hooks/use-app-form"
import { departmentOptionsQueryOptions } from "@/features/departments/api"
import { createPurchaseRequestFormDefaultValues } from "@/features/purchase-requests/schemas/create-purchase-request.schema"
import {
  PurchaseRequestStatus,
  purchaseRequestStatusLabels,
} from "@/lib/types/purchase-request.type"
import { cn } from "@/lib/utils"

// 3 bước đầu của vòng đời PR (bỏ REJECTED — đây là preview cho 1 đề xuất chưa tồn tại, chỉ
// cần thể hiện đường đi thuận, không cần nhánh từ chối).
const SUMMARY_STEPS = [
  PurchaseRequestStatus.DRAFT,
  PurchaseRequestStatus.PENDING_APPROVAL,
  PurchaseRequestStatus.APPROVED,
]

export const PurchaseRequestCreateSummaryCard = withForm({
  defaultValues: createPurchaseRequestFormDefaultValues,
  props: {},
  render: function Render({ form }) {
    const { data: departments = [] } = useQuery(departmentOptionsQueryOptions())

    return (
      <form.Subscribe
        selector={(state) => ({
          items: state.values.items,
          departmentId: state.values.departmentId,
          neededDate: state.values.neededDate,
        })}
      >
        {({ items, departmentId, neededDate }) => {
          const totalQuantity = items.reduce(
            (sum, item) => sum + (Number(item.quantity) || 0),
            0
          )
          const department = departments.find((d) => d.id === departmentId)
          const neededDateLabel =
            neededDate.length > 0
              ? DateTime.fromISO(neededDate).toFormat("dd/MM/yyyy")
              : "—"

          return (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Tóm tắt đề xuất
                </h2>
                <p className="text-sm text-muted-foreground">
                  Xem lại trước khi tạo
                </p>
              </div>

              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Số dòng vật tư</dt>
                  <dd className="font-medium text-foreground tabular-nums">
                    {items.length}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Tổng số lượng</dt>
                  <dd className="font-medium text-foreground tabular-nums">
                    {totalQuantity}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Phòng ban</dt>
                  <dd className="font-medium text-foreground">
                    {department?.name ?? "Chưa chọn"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Ngày cần hàng</dt>
                  <dd className="font-medium text-foreground">
                    {neededDateLabel}
                  </dd>
                </div>
              </dl>

              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-xs font-medium text-foreground">
                  Quy trình duyệt
                </p>
                <ul className="space-y-2">
                  {SUMMARY_STEPS.map((step, index) => (
                    <li key={step} className="flex items-center gap-2 text-xs">
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                          index === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {index + 1}
                      </span>
                      <span
                        className={
                          index === 0
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {purchaseRequestStatusLabels[step]}
                      </span>
                      {index === 0 && (
                        <span className="ml-auto text-[10px] text-primary">
                          Sẽ tạo ở đây
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        }}
      </form.Subscribe>
    )
  },
})
