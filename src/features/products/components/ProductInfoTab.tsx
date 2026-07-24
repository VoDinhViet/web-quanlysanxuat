import { Activity } from "react"
import { AlertOctagon } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { withForm } from "@/hooks/use-app-form"
import { ProductInfoSection } from "@/features/products/components/ProductInfoSection"
import { PRODUCT_FORM_DEFAULT_VALUES } from "@/features/products/schemas/product-form.schema"
import type { ComboboxOption } from "@/components/shared/ComboboxField"
import type { ProductFormSchema } from "@/features/products/schemas/product-form.schema"
import type {
  Product,
  ProductFilterOption,
} from "@/features/products/types/product.type"

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
    errorMessage: undefined as string | undefined,
    unitOptions: [] as ProductFilterOption[],
    productGroupOptions: [] as ProductFilterOption[],
    selectedClient: undefined as ComboboxOption | undefined,
  },
  render: function Render({
    form,
    isSaving,
    errorMessage,
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
        {/* Padded on its own: the form is now flush inside the page panel. */}
        <Activity mode={errorMessage ? "visible" : "hidden"}>
          <div className="px-4 pt-4 sm:px-5">
            <Alert className="border-destructive/20 bg-destructive/10 text-destructive">
              <AlertOctagon className="size-4" />
              <AlertTitle>{errorMessage}</AlertTitle>
            </Alert>
          </div>
        </Activity>

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
