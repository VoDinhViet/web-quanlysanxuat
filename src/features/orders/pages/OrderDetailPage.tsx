import { useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { OrderDetailHeader } from "@/features/orders/components/OrderDetailHeader"
import { OrderDetailInfoTab } from "@/features/orders/components/OrderDetailInfoTab"
import { OrderDetailItemsTab } from "@/features/orders/components/OrderDetailItemsTab"
import { OrderDetailNotesTab } from "@/features/orders/components/OrderDetailNotesTab"
import { OrderDetailSidebar } from "@/features/orders/components/OrderDetailSidebar"
import { OrderDetailStatCards } from "@/features/orders/components/OrderDetailStatCards"
import { orderQueryOptions } from "@/features/orders/api/orders.options"
import { ORDER_DETAIL_TABS } from "@/features/orders/schemas/order-detail-search.schema"

export function OrderDetailPage() {
  const { orderId } = useParams({
    from: "/(authed)/manage_/orders_/$orderId",
  })
  const { tab } = useSearch({ from: "/(authed)/manage_/orders_/$orderId" })
  const navigate = useNavigate({ from: "/manage/orders/$orderId" })

  const { data: order } = useSuspenseQuery(orderQueryOptions(orderId))

  // Radix widens onValueChange to `string`; `find` narrows it back without a
  // cast. Clicking a locked trigger never fires this (disabled), so an
  // unrecognised value only ever comes from a hand-mangled URL.
  const handleTabChange = (value: string) => {
    const nextTab = ORDER_DETAIL_TABS.find((item) => item === value)

    if (nextTab) {
      void navigate({ search: { tab: nextTab } })
    }
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết đơn hàng"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Đơn hàng (SO)", href: "/manage/orders" },
          { label: order.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <OrderDetailStatCards order={order} />

        <section className="overflow-hidden rounded-lg bg-card shadow-card">
          <Tabs value={tab} onValueChange={handleTabChange} className="gap-0">
            <OrderDetailHeader order={order} />

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="min-w-0">
                <TabsContent value="info" className="m-0 outline-none">
                  <OrderDetailInfoTab order={order} />
                </TabsContent>

                <TabsContent value="items" className="m-0 outline-none">
                  <OrderDetailItemsTab order={order} />
                </TabsContent>

                <TabsContent value="notes" className="m-0 outline-none">
                  <OrderDetailNotesTab order={order} />
                </TabsContent>
              </div>

              <aside className="min-w-0 border-t border-border xl:border-t-0 xl:border-l">
                <OrderDetailSidebar order={order} />
              </aside>
            </div>
          </Tabs>
        </section>
      </div>
    </main>
  )
}
