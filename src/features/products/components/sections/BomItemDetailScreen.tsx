import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { revalidateLogic } from "@tanstack/react-form"
import type { Key } from "react-aria-components"

import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { BomItemDetailHeader } from "@/features/products/components/layouts/BomItemDetailHeader"
import { BomItemDetailSidebar } from "@/features/products/components/layouts/BomItemDetailSidebar"
import { BomItemInfoTab } from "@/features/products/components/sections/BomItemInfoTab"
import { BomItemDirectsTable } from "@/features/products/components/composites/BomItemDirectsTable"
import { ProductOperationsPanel } from "@/features/products/components/composites/ProductOperationsPanel"
import { DeleteBomItemDialog } from "@/features/products/components/composites/DeleteBomItemDialog"
import { useProductBom } from "@/features/products/hooks/use-product-bom"
import { bomItemOperationsQueryOptions } from "@/features/products/api/options"
import { useHasPermission } from "@/hooks/use-permissions"
import { useAppForm } from "@/hooks/use-app-form"
import { bomItemDetailTabSchema } from "@/features/products/schemas/bom-item-detail-search.schema"
import { updateBomItemSchema } from "@/features/products/schemas/update-bom-item.schema"
import { cn } from "@/lib/utils"
import type { UpdateBomItemSchema } from "@/features/products/schemas/update-bom-item.schema"
import type { BomItem } from "@/lib/types/bom-item.type"
import type { Item } from "@/lib/types/item.type"

// `sortOrder` không có ô sửa ở form Thông tin chung nữa (BomItemInfoTab) nên không vào
// defaultValues cho mọi loại node — thiếu key = PATCH giữ nguyên thứ tự hiện tại, đúng ngữ nghĩa
// của field này.
function getBomItemDefaultValues(bomItem: BomItem): UpdateBomItemSchema {
  return {
    ...(bomItem.type === "COMPONENT"
      ? {
          code: bomItem.code,
          name: bomItem.name,
          unitId: bomItem.unit?.id,
          image: bomItem.image,
        }
      : {}),
    quantity: bomItem.quantity,
    note: bomItem.note ?? "",
  }
}

type BomItemDetailScreenProps = {
  product: Item
  bomItem: BomItem
  // Cả cây — dùng để tra cha, con vật tư trực tiếp và điều kiện "còn thêm được vật tư".
  nodes: BomItem[]
}

export function BomItemDetailScreen({
  product,
  bomItem,
  nodes,
}: BomItemDetailScreenProps) {
  const { tab } = useSearch({
    from: "/(authed)/manage_/products_/$productId_/bom/$bomItemId",
  })
  const navigate = useNavigate({
    from: "/manage/products/$productId/bom/$bomItemId",
  })
  const canEditBom = useHasPermission("items:bom-manage")

  // Không còn kèm trong GET .../bom nữa — route loader đã prefetch, nên đọc ngay được ở cả tab
  // Công đoạn lẫn số đếm trên sidebar (tab Thông tin) mà không cần chờ.
  const { data: operations } = useSuspenseQuery(
    bomItemOperationsQueryOptions(product.id, bomItem.id)
  )

  const [deletingBomItem, setDeletingBomItem] = useState<BomItem | null>(null)

  // Một lượt qua `nodes` thay vì find/filter/some riêng lẻ — cùng gom cha, đếm vật tư con trực
  // tiếp (chỉ cần số đếm cho sidebar — danh sách thật giờ đọc qua query riêng, phân trang ở BE,
  // xem BomItemDirectsTable.tsx), và "còn cấu trúc con COMPONENT bên dưới" (quyết định
  // `hasChildPart`: vật tư thêm ở tab Vật tư là vật tư ngoài cấu trúc).
  let parent: BomItem | null = null
  let directsCount = 0
  let hasChildPart = false
  for (const node of nodes) {
    if (node.id === bomItem.parentId) parent = node
    if (node.parentId === bomItem.id) {
      if (node.type === "DIRECT") directsCount += 1
      else hasChildPart = true
    }
  }
  const bom = useProductBom(product.id, {
    onSuccessDelete: () => {
      setDeletingBomItem(null)
      void navigate({
        to: "/manage/products/$productId",
        params: { productId: product.id },
        search: { tab: "boms" },
      })
    },
  })

  const form = useAppForm({
    defaultValues: getBomItemDefaultValues(bomItem),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: updateBomItemSchema },
    onSubmit: ({ value }) => bom.updateItem(value, bomItem.id),
  })

  // RAC's onSelectionChange returns a `Key` (string | number); safeParse narrows it back
  // without a cast, and an unrecognised value simply doesn't navigate.
  function handleTabChange(key: Key) {
    const nextTab = bomItemDetailTabSchema.safeParse(String(key))

    if (nextTab.success) {
      void navigate({ search: { tab: nextTab.data } })
    }
  }

  function handleSave() {
    if (form.state.isSubmitting) return
    void form.handleSubmit()
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết hạng mục BOM"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Sản phẩm", href: "/manage/products" },
          { label: `${product.code} · ${product.revision}` },
          { label: bomItem.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        {/* One continuous panel like the product detail page: header, tab strip, content
            and sidebar are separated by rules rather than by gaps. */}
        <section className="overflow-hidden rounded-lg bg-card shadow-card">
          <Tabs value={tab} onValueChange={handleTabChange} className="gap-0">
            <BomItemDetailHeader
              product={product}
              bomItem={bomItem}
              activeTab={tab}
              isSaving={bom.isSaving}
              onSave={handleSave}
              onRequestDelete={setDeletingBomItem}
            />

            {/* `minmax(0,1fr)` (not `1fr`) so a wide table scrolls inside its own column
                instead of blowing the grid out horizontally. The Vật tư/Công đoạn tabs'
                tables already run wide, so they drop the sidebar column entirely and take
                the full width rather than fighting it for space. */}
            <div
              className={cn(
                "grid grid-cols-1",
                tab === "info" &&
                  "xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]"
              )}
            >
              <div className="min-w-0">
                {/* keepMounted: Base UI unmounts inactive panels by default, which would
                    discard unsaved form state on every tab switch. Kept mounted but
                    inactive still gets `data-hidden` as the CSS hook that actually hides
                    it. */}
                <TabsContent
                  value="info"
                  keepMounted
                  className="m-0 outline-none data-hidden:hidden"
                >
                  <BomItemInfoTab
                    form={form}
                    disabled={!canEditBom || bom.isSaving}
                  />
                </TabsContent>

                <TabsContent value="directs" className="m-0 outline-none">
                  <div className="px-4 py-5 sm:px-5">
                    <BomItemDirectsTable
                      productId={product.id}
                      bomItem={bomItem}
                      hasChildPart={hasChildPart}
                      bom={bom}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="operations" className="m-0 outline-none">
                  <div className="px-4 py-5 sm:px-5">
                    <ProductOperationsPanel
                      target={{ productId: product.id, bomItemId: bomItem.id }}
                      productOperations={operations}
                      isPending={false}
                    />
                  </div>
                </TabsContent>
              </div>

              {/* A grid item stretches by default, so the rule runs the full height of the
                  row instead of stopping at the content. */}
              {tab === "info" ? (
                <aside className="min-w-0 border-t border-border xl:border-t-0 xl:border-l">
                  <BomItemDetailSidebar
                    product={product}
                    bomItem={bomItem}
                    parent={parent}
                    directsCount={directsCount}
                    operationsCount={operations.length}
                  />
                </aside>
              ) : null}
            </div>
          </Tabs>
        </section>
      </div>

      <DeleteBomItemDialog
        bomItem={deletingBomItem}
        onOpenChange={(open) => {
          if (!open) setDeletingBomItem(null)
        }}
        onConfirm={() => {
          if (deletingBomItem) bom.deleteItem(deletingBomItem.id)
        }}
      />
    </main>
  )
}
