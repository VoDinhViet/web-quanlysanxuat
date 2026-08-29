import { useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { ProductDetailHeader } from "@/features/products/components/ProductDetailHeader"
import { ProductDetailSidebar } from "@/features/products/components/ProductDetailSidebar"
import { ProductBomTab } from "@/features/products/components/ProductBomTab"
import { ProductIssuesTab } from "@/features/products/components/ProductIssuesTab"
import { ProductInfoTab } from "@/features/products/components/ProductInfoTab"
import { updateProductSchema } from "@/features/products/schemas/update-product.schema"
import { productDetailTabSchema } from "@/features/products/schemas/product-detail-search.schema"
import { updateItem } from "@/features/products/api/server-functions/update-item.api"
import { itemQueryOptions } from "@/features/products/api/options"
import { useAppForm } from "@/hooks/use-app-form"
import { buildSelectOption, cn } from "@/lib/utils"
import type { UpdateProductSchema } from "@/features/products/schemas/update-product.schema"
import type { Item } from "@/lib/types/item.type"

// Item → raw form values: nullable relations/text become "", the nested
// unit/client refs collapse to their id for the selects.
function getProductDefaultValues(product: Item): UpdateProductSchema {
  return {
    itemId: product.id,
    code: product.code,
    name: product.name,
    unitId: product.unit.id,
    type: product.type,
    clientId: product.client?.id ?? "",
    image: product.image,
    files: product.files.map((itemFile) => itemFile.file),
    status: product.status,
    note: product.note ?? "",
  }
}

export function ProductDetailPage() {
  const { productId } = useParams({
    from: "/(authed)/manage_/products_/$productId",
  })
  const { tab } = useSearch({ from: "/(authed)/manage_/products_/$productId" })
  const navigate = useNavigate({ from: "/manage/products/$productId" })
  const queryClient = useQueryClient()
  const updateItemFn = useServerFn(updateItem)

  const { data: product } = useSuspenseQuery(itemQueryOptions(productId))

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateProductSchema) => updateItemFn({ data: value }),
    // Stay on the page: this is a multi-tab authoring screen, so saving one tab
    // is no reason to navigate away.
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["items"] })
      toast.success("Đã lưu thông tin sản phẩm")
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getProductDefaultValues(product),
    validators: { onSubmit: updateProductSchema },
    onSubmit: ({ value }) => update(value),
  })

  // Radix widens onValueChange to `string`; safeParse narrows it back without
  // a cast, and an unrecognised value simply doesn't navigate.
  const handleTabChange = (value: string) => {
    const nextTab = productDetailTabSchema.safeParse(value)

    if (nextTab.success) {
      void navigate({ search: { tab: nextTab.data } })
    }
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết sản phẩm"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Sản phẩm", href: "/manage/products" },
          { label: product.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        {/* One continuous panel like the list page: header, tab strip, content
            and sidebar are separated by rules rather than by gaps. */}
        <section className="overflow-hidden rounded-lg bg-card shadow-card">
          <Tabs value={tab} onValueChange={handleTabChange} className="gap-0">
            <ProductDetailHeader
              product={product}
              activeTab={tab}
              isSaving={isPending}
              onSave={() => {
                if (form.state.isSubmitting) return
                void form.handleSubmit()
              }}
            />

            {/* `minmax(0,1fr)` (not `1fr`) so a wide table scrolls inside its own
                column instead of blowing the grid out horizontally. The "boms"
                tab's BOM table already runs wide (STT/mã/tên/cấp/số lượng/đvt/
                công đoạn/thao tác), so it drops the sidebar column entirely and
                takes the full width rather than fighting it for space. */}
            <div
              className={cn(
                "grid grid-cols-1",
                tab !== "boms" &&
                  "xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]"
              )}
            >
              <div className="min-w-0">
                {/* forceMount: Radix unmounts inactive panels by default, which
                  would discard unsaved form state on every tab switch. */}
                <TabsContent
                  value="info"
                  forceMount
                  className="m-0 outline-none data-[state=inactive]:hidden"
                >
                  <ProductInfoTab
                    form={form}
                    isSaving={isPending}
                    selectedClient={buildSelectOption(product.client)}
                  />
                </TabsContent>

                <TabsContent value="boms" className="m-0 outline-none">
                  <ProductBomTab product={product} />
                </TabsContent>

                <TabsContent value="materials" className="m-0 outline-none">
                  <ProductIssuesTab product={product} />
                </TabsContent>
              </div>

              {/* A grid item stretches by default, so the rule runs the full
                  height of the row instead of stopping at the content. */}
              {tab !== "boms" ? (
                <aside className="min-w-0 border-t border-border xl:border-t-0 xl:border-l">
                  <ProductDetailSidebar product={product} />
                </aside>
              ) : null}
            </div>
          </Tabs>
        </section>
      </div>
    </main>
  )
}
