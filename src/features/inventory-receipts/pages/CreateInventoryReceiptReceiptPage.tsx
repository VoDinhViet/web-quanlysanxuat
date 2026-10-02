import { useNavigate, useSearch } from "@tanstack/react-router"

import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { CreateInventoryReceiptReceiptTabs } from "@/features/inventory-receipts/components/layouts/CreateInventoryReceiptReceiptTabs"
import { CreateInventoryReceiptFromPoForm } from "@/features/inventory-receipts/components/sections/CreateInventoryReceiptFromPoForm"
import { CreateInventoryReceiptOtherForm } from "@/features/inventory-receipts/components/sections/CreateInventoryReceiptOtherForm"
import { CreateInventoryReceiptReturnForm } from "@/features/inventory-receipts/components/sections/CreateInventoryReceiptReturnForm"
import { createInventoryReceiptLaneSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt-lane-search.schema"

// Trang gộp cả 3 làn tạo phiếu nhập kho (Nhập mua hàng — wizard từ PO / Nhập từ khách hàng / Nhập từ khác) — một route, phân
// làn bằng `?lane=`, thay vì route riêng. Mỗi TabsContent render nguyên 1 form tự chứa (bg-card +
// help panel riêng) — dải tab không bọc card, không gộp "one continuous panel" như
// ProductDetailPage.tsx, tránh card lồng card.
export function CreateInventoryReceiptReceiptPage() {
  const { lane } = useSearch({
    from: "/(authed)/manage_/inventory-receipts_/create-receipt",
  })
  const navigate = useNavigate({
    from: "/manage/inventory-receipts/create-receipt",
  })

  // safeParse narrows the tab value back to a lane without a cast, cùng khuôn ProductDetailPage.tsx.
  const handleLaneChange = (value: unknown) => {
    const nextLane = createInventoryReceiptLaneSchema.safeParse(value)

    if (nextLane.success) {
      void navigate({ search: { lane: nextLane.data } })
    }
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo phiếu nhập kho"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý kho" },
          { label: "Nhập kho", href: "/manage/inventory-receipts" },
          { label: "Tạo phiếu nhập kho" },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <Tabs value={lane} onValueChange={handleLaneChange} className="gap-4">
          <CreateInventoryReceiptReceiptTabs />

          <TabsContent value="po">
            <CreateInventoryReceiptFromPoForm />
          </TabsContent>

          <TabsContent value="return">
            <CreateInventoryReceiptReturnForm />
          </TabsContent>

          <TabsContent value="other">
            <CreateInventoryReceiptOtherForm />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
