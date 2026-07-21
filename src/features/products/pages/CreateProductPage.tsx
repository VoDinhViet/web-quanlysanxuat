import { useSuspenseQuery } from "@tanstack/react-query"

import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { CreateProductForm } from "@/features/products/components/CreateProductForm"
import { ProductDetailTabs } from "@/features/products/components/ProductDetailTabs"
import {
  productGroupOptionsQueryOptions,
  unitOptionsQueryOptions,
} from "@/features/products/products.query"

const LOCKED_TABS_HINT =
  "Lưu thông tin sản phẩm trước để mở khoá bước này — cấu trúc và vật tư cần mã sản phẩm đã tạo."

export function CreateProductPage() {
  const { data: unitOptions } = useSuspenseQuery(unitOptionsQueryOptions())
  const { data: productGroupOptions } = useSuspenseQuery(
    productGroupOptionsQueryOptions()
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo sản phẩm"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Sản phẩm", href: "/manage/products" },
          { label: "Tạo sản phẩm" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        {/* Same tab strip as the detail screen, with steps 2-3 locked: the user
            sees the whole route up front, and the two pages read as one flow
            instead of the save jumping to a screen that looks unrelated. */}
        <Tabs value="info" className="gap-0">
          <ProductDetailTabs
            lockedTabs={["structure", "materials", "revisions"]}
            lockedHint={LOCKED_TABS_HINT}
          />

          <TabsContent value="info" className="m-0 mt-5 outline-none">
            <p className="mb-4 text-xs font-medium text-muted-foreground">
              Bước 1/3 — sau khi lưu, bạn sẽ khai báo cấu trúc sản phẩm và thành
              phần vật tư.
            </p>

            <CreateProductForm
              unitOptions={unitOptions}
              productGroupOptions={productGroupOptions}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
