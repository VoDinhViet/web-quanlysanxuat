import { useNavigate, useSearch } from "@tanstack/react-router"

import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { InventoryReceiptCreateReceiptTabs } from "@/features/inventory-receipts/components/layouts/InventoryReceiptCreateReceiptTabs"
import { InventoryReceiptCreateFromPoForm } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateFromPoForm"
import { InventoryReceiptCreateReturnForm } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateReturnForm"
import { inventoryReceiptCreateLaneSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt-lane-search.schema"

// Trang gộp cả 2 làn tạo phiếu nhập kho ("Từ PO" wizard 4 bước / "Khách hàng") — một route, phân
// làn bằng `?lane=`, thay vì route riêng. Mỗi TabsContent render nguyên 1 form tự chứa (bg-card +
// help panel riêng) — dải tab không bọc card, không gộp "one continuous panel" như
// ProductDetailPage.tsx, tránh card lồng card.
export function InventoryReceiptCreateReceiptPage() {
  const { lane } = useSearch({
    from: "/(authed)/manage_/inventory-receipts_/create-receipt",
  })
  const navigate = useNavigate({
    from: "/manage/inventory-receipts/create-receipt",
  })

  // Radix widens onValueChange to `string`; safeParse narrows it back without a cast, cùng
  // khuôn ProductDetailPage.tsx's handleTabChange.
  const handleLaneChange = (value: string) => {
    const nextLane = inventoryReceiptCreateLaneSchema.safeParse(value)

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
          <InventoryReceiptCreateReceiptTabs />

          <TabsContent value="po" className="m-0 outline-none">
            <InventoryReceiptCreateFromPoForm />
          </TabsContent>

          <TabsContent value="return" className="m-0 outline-none">
            <InventoryReceiptCreateReturnForm />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
