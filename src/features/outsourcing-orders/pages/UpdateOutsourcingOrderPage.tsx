import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { DateTime } from "luxon"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import {
  outsourcingOrderItemsQueryOptions,
  outsourcingOrderQueryOptions,
} from "@/features/outsourcing-orders/api/options"
import { OutsourcingOrderForm } from "@/features/outsourcing-orders/components/sections/OutsourcingOrderForm"
import type { CreateOutsourcingOrderSchema } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"
import type {
  OutsourcingOrderDetail,
  OutsourcingOrderItem,
} from "@/lib/types/outsourcing-order.type"

function toDateInputValue(isoDate: string): string {
  return DateTime.fromISO(isoDate, { zone: "utc" }).toFormat("yyyy-MM-dd")
}

// Dựng lại giá trị form từ phiếu đã lưu. Dòng không gắn Job (không có công đoạn Job) không dựng
// được vào wizard nên bị bỏ qua; `sentQuantity` ở đây là SL đã gửi ở các phiếu khác, nên "còn được
// gửi" = định mức − đã gửi ở phiếu khác, không trừ lặp chính phiếu đang sửa.
function toFormValues(
  order: OutsourcingOrderDetail,
  orderItems: OutsourcingOrderItem[]
): CreateOutsourcingOrderSchema {
  return {
    supplierId: order.supplier.id,
    sendDate: toDateInputValue(order.sendDate),
    expectedReturnDate: order.expectedReturnDate
      ? toDateInputValue(order.expectedReturnDate)
      : "",
    note: order.note ?? "",
    items: orderItems.flatMap((orderItem) => {
      if (
        !orderItem.productionJobOperationId ||
        !orderItem.productionJobBomItemId ||
        !orderItem.productionJob
      ) {
        return []
      }

      const plannedQuantity = orderItem.plannedQuantity ?? 0

      return [
        {
          productionJobOperationId: orderItem.productionJobOperationId,
          productionJobBomItemId: orderItem.productionJobBomItemId,
          itemId: orderItem.item?.id ?? null,
          job: orderItem.productionJob,
          bomItem: { code: orderItem.itemCode, name: orderItem.itemName },
          operation: {
            operationId: orderItem.operationId,
            code: orderItem.operationCode,
            name: orderItem.operationName,
          },
          unit: orderItem.unit,
          image: orderItem.image,
          plannedQuantity,
          sentQuantity: orderItem.sentByOtherOrdersQuantity,
          remainingQuantity:
            plannedQuantity - orderItem.sentByOtherOrdersQuantity,
          quantity: orderItem.quantity,
          weight: orderItem.weight ?? undefined,
          area: orderItem.area ?? undefined,
          note: orderItem.note ?? "",
        },
      ]
    }),
  }
}

export function UpdateOutsourcingOrderPage() {
  const { outsourcingOrderId } = useParams({
    from: "/(authed)/manage_/outsourcing-orders_/$outsourcingOrderId_/update",
  })

  const { data: order } = useSuspenseQuery(
    outsourcingOrderQueryOptions(outsourcingOrderId)
  )
  const { data: orderItems } = useSuspenseQuery(
    outsourcingOrderItemsQueryOptions(outsourcingOrderId)
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title={`Sửa phiếu ${order.code}`}
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Gia công ngoài", href: "/manage/outsourcing-orders" },
          {
            label: "Xuất đi gia công (OS-OUT)",
            href: "/manage/outsourcing-orders",
          },
          { label: order.code },
          { label: "Sửa" },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <OutsourcingOrderForm
          editing={{
            outsourcingOrderId,
            defaultValues: toFormValues(order, orderItems),
            supplierOption: {
              value: order.supplier.id,
              label: order.supplier.name,
            },
          }}
        />
      </div>
    </main>
  )
}
