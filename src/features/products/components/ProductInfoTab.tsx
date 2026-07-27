import { withForm } from "@/hooks/use-app-form"
import { ProductInfoSection } from "@/features/products/components/ProductInfoSection"
import { PRODUCT_FORM_DEFAULT_VALUES } from "@/features/products/schemas/product-form.schema"
import type { ComboboxOption } from "@/components/shared/ComboboxField"
import type { ProductFormSchema } from "@/features/products/schemas/product-form.schema"
import type { Product, ProductGroupRef } from "@/lib/types/product.type"
import type { Unit } from "@/lib/types/unit.type"

// Product → raw form values: nullable relations/text become "", the nested
// unit/group/client refs collapse to their id for the selects.
export function buildProductDefaultValues(product: Product): ProductFormSchema {
  return {
    code: product.code,
    name: product.name,
    unitId: product.unit.id,
    productGroupId: product.group?.id ?? "",
    clientId: product.client?.id ?? "",
    image: product.image,
    attachments: product.attachments.map((attachment) => ({
      id: attachment.file.id,
      url: attachment.file.url,
      originalName: attachment.file.originalName,
    })),
    status: product.status,
    note: product.note ?? "",
  }
}

// The form instance is owned by ProductDetailPage, because the header's "Lưu"
// button sits outside this panel and submits the same form.
export const ProductInfoTab = withForm({
  defaultValues: PRODUCT_FORM_DEFAULT_VALUES,
  props: {
    isSaving: false,
    unitOptions: [] as Unit[],
    productGroupOptions: [] as ProductGroupRef[],
    selectedClient: undefined as ComboboxOption | undefined,
  },
  render: function Render({
    form,
    isSaving,
    unitOptions,
    productGroupOptions,
    selectedClient,
  }) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
        noValidate
      >
        <ProductInfoSection
          form={form}
          disabled={isSaving}
          unitOptions={unitOptions}
          productGroupOptions={productGroupOptions}
          selectedClient={selectedClient}
        />
      </form>
    )
  },
})
