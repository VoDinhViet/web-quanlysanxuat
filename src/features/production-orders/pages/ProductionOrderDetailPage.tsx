import { useState } from "react"
import { useParams } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { useAppForm } from "@/hooks/use-app-form"
import { orderQueryOptions } from "@/features/orders/api"
import { ProductionOrderDetailSummaryCard } from "@/features/production-orders/components/detail/ProductionOrderDetailSummaryCard"
import { ProductionOrderHistoryCard } from "@/features/production-orders/components/detail/ProductionOrderHistoryCard"
import { ProductionOrderItemsCard } from "@/features/production-orders/components/detail/ProductionOrderItemsCard"
import { productionOrderQueryOptions } from "@/features/production-orders/api/production-orders.options"
import { issueProductionOrder } from "@/features/production-orders/api/server-functions/issue-production-order.api"
import { updateProductionOrder } from "@/features/production-orders/api/server-functions/update-production-order.api"
import { updateProductionOrderSchema } from "@/features/production-orders/schemas/update-production-order.schema"
import type { UpdateProductionOrderSchema } from "@/features/production-orders/schemas/update-production-order.schema"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"

// production.items → raw form values: quantity becomes a string for the numeric <Input>,
// parsed back to a number by updateProductionOrderSchema on submit.
function buildDefaultValues(
  production: ProductionOrderDetail
): UpdateProductionOrderSchema {
  return {
    orderId: production.orderId,
    items: production.items.map((item) => ({
      orderItemId: item.orderItemId,
      quantity: String(item.quantity),
    })),
  }
}

export function ProductionOrderDetailPage() {
  const { orderId } = useParams({
    from: "/(authed)/manage_/production-orders_/$orderId",
  })
  const [isIssuing, setIsIssuing] = useState(false)

  const { data: production } = useSuspenseQuery(
    productionOrderQueryOptions(orderId)
  )
  const { data: order } = useSuspenseQuery(orderQueryOptions(orderId))

  const queryClient = useQueryClient()
  const updateProductionOrderFn = useServerFn(updateProductionOrder)
  const issueProductionOrderFn = useServerFn(issueProductionOrder)

  const saveMutation = useMutation({
    mutationFn: (value: UpdateProductionOrderSchema) =>
      updateProductionOrderFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["production-orders"] })
      toast.success("Đã lưu kế hoạch sản xuất")
    },
    onError: (error) => toast.error(error.message),
  })

  const issueMutation = useMutation({
    mutationFn: () => issueProductionOrderFn({ data: { orderId } }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["production-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ])
      toast.success("Đã duyệt lệnh sản xuất")
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: buildDefaultValues(production),
    validators: { onSubmit: updateProductionOrderSchema },
    onSubmit: ({ value }) => saveMutation.mutate(value),
  })

  // "Duyệt LSX" phải lưu số lượng đang có trên form trước — backend chốt phát hành theo bản đã
  // lưu (production_orders table), không phải theo form state chưa lưu. Xem Context trong plan.
  // Cùng shape/validator với "Lưu nháp" (updateProductionOrderSchema chạy ở chính server
  // function khi RPC gửi đi) — không parse lại ở client để tránh lệch type với form.state.values.
  const handleIssue = () => {
    setIsIssuing(true)
    saveMutation.mutate(form.state.values, {
      onSuccess: () => {
        issueMutation.mutate(undefined, {
          onSettled: () => setIsIssuing(false),
        })
      },
      onError: () => setIsIssuing(false),
    })
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết lệnh sản xuất"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Lệnh sản xuất (LSX)", href: "/manage/production-orders" },
          { label: production.orderCode },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <ProductionOrderDetailSummaryCard
          production={production}
          order={order}
          isSaving={saveMutation.isPending}
          isIssuing={isIssuing}
          onSave={() => form.handleSubmit()}
          onIssue={handleIssue}
        />

        <section className="overflow-hidden rounded-lg bg-card shadow-card">
          <ProductionOrderItemsCard form={form} production={production} />
        </section>

        <ProductionOrderHistoryCard order={order} />
      </div>
    </main>
  )
}
