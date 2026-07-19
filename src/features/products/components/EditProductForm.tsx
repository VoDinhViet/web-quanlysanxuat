import { Activity } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertOctagon, Loader2, Save } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { CreateProductInfoSection } from "@/features/products/components/CreateProductInfoSection"
import { createProductSchema } from "@/features/products/schemas/create-product.schema"
import { updateProduct } from "@/features/products/server-functions/update-product"
import type { CreateProductSchema } from "@/features/products/schemas/create-product.schema"
import type {
  Product,
  ProductFilterOption,
} from "@/features/products/types/product.type"

// Product → raw form values: nullable relations/text become "", the nested
// unit/group/client refs collapse to their id for the selects.
function buildProductDefaultValues(product: Product): CreateProductSchema {
  return {
    code: product.code,
    name: product.name,
    unitId: product.unit.id,
    productGroupId: product.group?.id ?? "",
    clientId: product.client?.id ?? "",
    revision: product.revision,
    imageUrl: product.imageUrl ?? "",
    status: product.status,
    note: product.note ?? "",
  }
}

type EditProductFormProps = {
  product: Product
  unitOptions: ProductFilterOption[]
  productGroupOptions: ProductFilterOption[]
}

export function EditProductForm({
  product,
  unitOptions,
  productGroupOptions,
}: EditProductFormProps) {
  const navigate = useNavigate({ from: "/manage/products/$productId/edit" })
  const queryClient = useQueryClient()
  const updateProductFn = useServerFn(updateProduct)

  const {
    mutate: update,
    isPending,
    error,
  } = useMutation({
    mutationFn: (value: CreateProductSchema) =>
      updateProductFn({ data: { ...value, productId: product.id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      await navigate({
        to: "/manage/products",
        search: { page: 1, limit: 10 },
      })
    },
  })

  const form = useAppForm({
    defaultValues: buildProductDefaultValues(product),
    validators: {
      onSubmit: createProductSchema,
    },
    onSubmit: ({ value }) => update(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="space-y-6"
    >
      <Activity mode={error ? "visible" : "hidden"}>
        <Alert className="border-destructive/20 bg-destructive/10 text-destructive">
          <AlertOctagon className="size-4" />
          <AlertTitle>{error?.message}</AlertTitle>
        </Alert>
      </Activity>

      <div className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <CreateProductInfoSection
          form={form}
          disabled={isPending}
          unitOptions={unitOptions}
          productGroupOptions={productGroupOptions}
          selectedClient={
            product.client
              ? { value: product.client.id, label: product.client.name }
              : undefined
          }
        />

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              void navigate({
                to: "/manage/products",
                search: { page: 1, limit: 10 },
              })
            }
          >
            Hủy
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || isPending}
              >
                {isSubmitting || isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Đang lưu
                  </>
                ) : (
                  <>
                    <Save />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  )
}
