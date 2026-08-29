import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { InventoryReceiptCreateReceiptTabs } from "@/features/inventory-receipts/components/layouts/InventoryReceiptCreateReceiptTabs"
import { InventoryReceiptCreateFromPoForm } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateFromPoForm"
import { InventoryReceiptCreateOtherForm } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateOtherForm"
import { InventoryReceiptCreateReturnForm } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateReturnForm"
import { inventoryReceiptCreateLaneSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt-lane-search.schema"
import { warehouseOptionsQueryOptions } from "@/features/warehouses/api"

// Trang gộp cả 3 làn tạo phiếu nhập kho ("Từ PO" wizard 4 bước / "Khách hàng" / "Khác", 2 làn
// sau là form 1 bước) — một route, phân làn bằng `?lane=`, thay vì 3 route riêng như trước. Mỗi
// TabsContent render nguyên 1 form tự chứa (bg-card + help panel riêng) — dải tab không bọc
// card, không gộp "one continuous panel" như ProductDetailPage.tsx, tránh card lồng card.
export function InventoryReceiptCreateReceiptPage() {
  const { lane } = useSearch({
    from: "/(authed)/manage_/inventory-receipts_/create-receipt",
  })
  const navigate = useNavigate({
    from: "/manage/inventory-receipts/create-receipt",
  })

  // Kho RM ("Kho nguyên vật liệu") — route loader đã prefetch, chỉ đúng 1 kho loại này. Làn
  // "Khách hàng"/"Khác" tự gắn warehouseId từ đây, không có picker; làn "Từ PO" không đọc giá
  // trị này (tự suy kho từ PO đã chọn).
  const { data: rmWarehouses } = useSuspenseQuery(
    warehouseOptionsQueryOptions({ type: "RM" })
  )
  const warehouseId = rmWarehouses[0]?.id ?? ""

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
            <InventoryReceiptCreateReturnForm warehouseId={warehouseId} />
          </TabsContent>

          <TabsContent value="other" className="m-0 outline-none">
            <InventoryReceiptCreateOtherForm warehouseId={warehouseId} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
