import { useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { ProductDetailHeader } from "@/features/products/components/ProductDetailHeader"
import { ProductDetailSidebar } from "@/features/products/components/ProductDetailSidebar"
import { ProductTabPlaceholder } from "@/features/products/components/ProductTabPlaceholder"
import {
  ProductInfoTab,
  buildProductDefaultValues,
} from "@/features/products/components/ProductInfoTab"
import { createProductSchema } from "@/features/products/schemas/create-product.schema"
import { PRODUCT_DETAIL_TABS } from "@/features/products/schemas/product-detail-search.schema"
import { updateProduct } from "@/features/products/server-functions/update-product"
import { useAppForm } from "@/hooks/use-app-form"
import {
  productGroupOptionsQueryOptions,
  productQueryOptions,
  unitOptionsQueryOptions,
} from "@/features/products/products.query"
import type { CreateProductSchema } from "@/features/products/schemas/create-product.schema"

export function ProductDetailPage() {
  const { productId } = useParams({
    from: "/(authed)/manage_/products_/$productId",
  })
  const { tab } = useSearch({ from: "/(authed)/manage_/products_/$productId" })
  const navigate = useNavigate({ from: "/manage/products/$productId" })
  const queryClient = useQueryClient()
  const updateProductFn = useServerFn(updateProduct)

  const { data: product } = useSuspenseQuery(productQueryOptions(productId))
  const { data: unitOptions } = useSuspenseQuery(unitOptionsQueryOptions())
  const { data: productGroupOptions } = useSuspenseQuery(
    productGroupOptionsQueryOptions()
  )

  const {
    mutate: update,
    isPending,
    error,
  } = useMutation({
    mutationFn: (value: CreateProductSchema) =>
      updateProductFn({ data: { ...value, productId } }),
    // Stay on the page: this is a multi-tab authoring screen, so saving one tab
    // is no reason to navigate away.
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Đã lưu thông tin sản phẩm")
    },
  })

  const form = useAppForm({
    defaultValues: buildProductDefaultValues(product),
    validators: { onSubmit: createProductSchema },
    onSubmit: ({ value }) => update(value),
  })

  // Radix widens onValueChange to `string`; `find` narrows it back without a
  // cast, and an unrecognised value simply doesn't navigate.
  const handleTabChange = (value: string) => {
    const nextTab = PRODUCT_DETAIL_TABS.find((item) => item === value)

    if (nextTab) {
      void navigate({ search: { tab: nextTab } })
    }
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết sản phẩm"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Sản phẩm", href: "/manage/products" },
          { label: product.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        {/* One continuous panel like the list page: header, tab strip, content
            and sidebar are separated by rules rather than by gaps. */}
        <section className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <Tabs value={tab} onValueChange={handleTabChange} className="gap-0">
            <ProductDetailHeader
              product={product}
              activeTab={tab}
              isSaving={isPending}
              onSave={() => void form.handleSubmit()}
            />

            {/* `minmax(0,1fr)` (not `1fr`) so a wide table scrolls inside its own
                column instead of blowing the grid out horizontally. */}
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
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
                    errorMessage={error?.message}
                    unitOptions={unitOptions}
                    productGroupOptions={productGroupOptions}
                    selectedClient={
                      product.client
                        ? {
                            value: product.client.id,
                            label: product.client.name,
                          }
                        : undefined
                    }
                  />
                </TabsContent>

                <TabsContent value="structure" className="m-0 outline-none">
                  <ProductTabPlaceholder
                    title="Cấu trúc sản phẩm & Công đoạn"
                    description="Cây bản vẽ/part và công đoạn theo từng part sẽ có sau khi API cấu trúc sản phẩm hoàn thiện."
                  />
                </TabsContent>

                <TabsContent value="materials" className="m-0 outline-none">
                  <ProductTabPlaceholder
                    title="Thành phần vật tư"
                    description="Bảng định mức vật tư (BOM) sẽ có sau khi API thành phần vật tư hoàn thiện."
                  />
                </TabsContent>
              </div>

              {/* A grid item stretches by default, so the rule runs the full
                  height of the row instead of stopping at the content. */}
              <aside className="min-w-0 border-t border-border xl:border-t-0 xl:border-l">
                <ProductDetailSidebar product={product} />
              </aside>
            </div>
          </Tabs>
        </section>
      </div>
    </main>
  )
}
