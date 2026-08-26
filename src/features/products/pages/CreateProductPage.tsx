import { Tabs, TabsContent } from "@/components/ui/tabs"
import { CreateProductForm } from "@/features/products/components/CreateProductForm"
import { ProductDetailTabs } from "@/features/products/components/ProductDetailTabs"

const lockedTabsHint =
  "Lưu thông tin sản phẩm trước để mở khoá bước này — cấu trúc và vật tư cần mã sản phẩm đã tạo."

export function CreateProductPage() {
  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      {/* Same tab strip as the detail screen, with steps 2-3 locked: the user
          sees the whole route up front, and the two pages read as one flow
          instead of the save jumping to a screen that looks unrelated. */}
      <Tabs value="info" className="gap-0">
        <ProductDetailTabs
          lockedTabs={["boms", "materials"]}
          lockedHint={lockedTabsHint}
        />

        <TabsContent value="info" className="m-0 mt-5 outline-none">
          <p className="mb-4 text-xs font-medium text-muted-foreground">
            Bước 1/3 — sau khi lưu, bạn sẽ khai báo cấu trúc sản phẩm và thành
            phần vật tư.
          </p>

          <CreateProductForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
