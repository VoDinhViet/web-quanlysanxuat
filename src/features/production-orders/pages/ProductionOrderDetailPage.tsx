import { useState } from "react"
import { useParams } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { useAppForm } from "@/hooks/use-app-form"
import { orderQueryOptions } from "@/features/orders/api"
import { ProductionOrderDetailSummaryCard } from "@/features/production-orders/components/detail/ProductionOrderDetailSummaryCard"
import { ProductionOrderItemsCard } from "@/features/production-orders/components/detail/ProductionOrderItemsCard"
import { ProductionOrderLogsCard } from "@/features/production-orders/components/detail/ProductionOrderLogsCard"
import {
  productionOrderLogsQueryOptions,
  productionOrderQueryOptions,
} from "@/features/production-orders/api/options"
import { getChangedProductionItems } from "@/features/production-orders/logic/production-order-decision"
import { updateProductionOrder } from "@/features/production-orders/api/server-functions/update-production-order.api"
import { updateProductionOrderSchema } from "@/features/production-orders/schemas/update-production-order.schema"
import type { UpdateProductionOrderSchema } from "@/features/production-orders/schemas/update-production-order.schema"
import type { ProductionOrderDetail } from "@/lib/types/production-order.type"

function getProductionOrderDefaultValues(
  production: ProductionOrderDetail
): UpdateProductionOrderSchema {
  return {
    productionOrderId: production.id,
    items: production.items.map((item) => ({
      orderItemId: item.orderItemId,
      quantity: item.quantity,
    })),
  }
}

// The route param is the production order's own id, not the order's id (the backend detail
// lookup key) — `production.order.id` drives the order fetch below, so that query can't run in
// parallel with the production fetch (the loader awaits it first). Logs only need the route
// param, so they load alongside the order fetch instead of chaining after it too — see the
// route's loader.
export function ProductionOrderDetailPage() {
  const { productionOrderId } = useParams({
    from: "/(authed)/manage_/production-orders_/$productionOrderId",
  })

  const { data: production } = useSuspenseQuery(
    productionOrderQueryOptions(productionOrderId)
  )
  const { data: order } = useSuspenseQuery(
    orderQueryOptions(production.order.id)
  )

  // Client-driven, not loader-prefetched beyond page 1 — this is a secondary section on a page
  // that otherwise has no pagination state, so switching pages doesn't touch the URL.
  // `keepPreviousData` avoids a loading flash when flipping pages.
  const [logsPage, setLogsPage] = useState(1)
  const logsQuery = useQuery({
    ...productionOrderLogsQueryOptions(productionOrderId, logsPage),
    placeholderData: keepPreviousData,
  })

  const queryClient = useQueryClient()
  const updateProductionOrderFn = useServerFn(updateProductionOrder)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateProductionOrderSchema) =>
      updateProductionOrderFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["production-orders"] })
      toast.success("Đã lưu số lượng sản xuất")
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getProductionOrderDefaultValues(production),
    validators: { onSubmit: updateProductionOrderSchema },
    // Chỉ gửi dòng đã đổi — PATCH của backend là partial, dòng không gửi giữ nguyên giá trị đã
    // lưu.
    onSubmit: ({ value }) =>
      update({
        ...value,
        items: getChangedProductionItems(value, production),
      }),
  })

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết lệnh sản xuất"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Lệnh sản xuất (LSX)", href: "/manage/production-orders" },
          { label: order.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <form.Subscribe
          selector={(state) =>
            getChangedProductionItems(state.values, production).length > 0
          }
        >
          {(hasUnsavedChanges) => (
            <ProductionOrderDetailSummaryCard
              production={production}
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isPending}
              onSave={() => {
                if (form.state.isSubmitting) return
                void form.handleSubmit()
              }}
            />
          )}
        </form.Subscribe>

        <section className="overflow-hidden rounded-lg bg-card shadow-card">
          <ProductionOrderItemsCard
            form={form}
            production={production}
            isSaving={isPending}
          />
        </section>

        <ProductionOrderLogsCard
          logs={logsQuery.data?.data ?? []}
          pagination={logsQuery.data?.pagination}
          page={logsPage}
          onPageChange={setLogsPage}
          isPending={logsQuery.isPending}
          isFetching={logsQuery.isFetching}
        />
      </div>
    </main>
  )
}
