import { useState } from "react"
import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { FileText, Layers } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageBody } from "@/components/shared/layouts/PageBody"
import { PageShell } from "@/components/shared/layouts/PageShell"
import { Surface } from "@/components/shared/layouts/Surface"
import { inventoryRequisitionQueryOptions } from "@/features/inventory-requisitions/api/options"
import { InventoryRequisitionDetailHeader } from "@/features/inventory-requisitions/components/layouts/InventoryRequisitionDetailHeader"
import { InventoryRequisitionInfoCard } from "@/features/inventory-requisitions/components/composites/InventoryRequisitionInfoCard"
import { InventoryRequisitionItemsSection } from "@/features/inventory-requisitions/components/sections/InventoryRequisitionItemsSection"

export function InventoryRequisitionDetailPage() {
  const { requisitionId } = useParams({
    from: "/(authed)/manage_/inventory-requisitions_/$requisitionId",
  })

  const { data: detail } = useSuspenseQuery(
    inventoryRequisitionQueryOptions(requisitionId)
  )

  const [activeTab, setActiveTab] = useState<string>("items")

  return (
    <PageShell
      title="Chi tiết phiếu lãnh vật tư"
      breadcrumbs={[
        { label: "Quản lý sản xuất" },
        { label: "Lãnh vật tư", href: "/manage/inventory-requisitions" },
        { label: detail.code },
      ]}
    >
      <PageBody>
        <Surface>
          <InventoryRequisitionDetailHeader detail={detail} />

          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              if (typeof val === "string") setActiveTab(val)
            }}
            className="w-full gap-0 border-t border-border/60"
          >
            <div className="border-b border-border/60 px-4 pt-2 sm:px-5">
              <TabsList variant="line" className="h-10">
                <TabsTrigger
                  value="items"
                  className="gap-2 text-xs font-semibold"
                >
                  <Layers className="size-4" />
                  2. Chi tiết vật tư lãnh ({detail.items.length})
                </TabsTrigger>
                <TabsTrigger
                  value="info"
                  className="gap-2 text-xs font-semibold"
                >
                  <FileText className="size-4" />
                  1. Thông tin
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="items" className="m-0 outline-none">
              <InventoryRequisitionItemsSection detail={detail} />
            </TabsContent>

            <TabsContent value="info" className="m-0 outline-none">
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                  <div className="space-y-4">
                    <h3 className="font-heading text-sm font-semibold text-foreground">
                      Chi tiết thông tin phiếu
                    </h3>
                    <dl className="grid grid-cols-1 gap-4 rounded-lg border border-border/60 bg-muted/10 p-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Mã phiếu
                        </dt>
                        <dd className="font-mono text-sm font-semibold text-foreground">
                          {detail.code}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Loại lãnh
                        </dt>
                        <dd className="text-sm font-medium text-foreground">
                          {detail.type === "PRODUCTION"
                            ? "Lãnh từ LSX"
                            : "Lãnh khác"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          PO / Đơn hàng
                        </dt>
                        <dd className="font-mono text-sm font-semibold text-primary">
                          {detail.productionOrder?.order.code ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Mã LSX
                        </dt>
                        <dd className="font-mono text-sm text-foreground">
                          {detail.productionOrder?.code ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Job sản xuất
                        </dt>
                        <dd className="font-mono text-sm font-semibold text-foreground">
                          {detail.productionJob?.code ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Bộ phận
                        </dt>
                        <dd className="text-sm text-foreground">
                          {detail.department?.name ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Lý do lãnh
                        </dt>
                        <dd className="text-sm text-foreground">
                          {detail.reason ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Ghi chú
                        </dt>
                        <dd className="text-sm text-foreground">
                          {detail.note ?? "Không có ghi chú"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <InventoryRequisitionInfoCard detail={detail} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Surface>
      </PageBody>
    </PageShell>
  )
}
