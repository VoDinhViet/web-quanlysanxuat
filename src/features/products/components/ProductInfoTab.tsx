import { withForm } from "@/hooks/use-app-form"
import { UpdateProductInfoSection } from "@/features/products/components/UpdateProductInfoSection"
import { updateProductFormDefaultValues } from "@/features/products/schemas/update-product.schema"
import type { ComboboxOption } from "@/components/shared/composites/ComboboxField"

// The form instance is owned by ProductDetailPage, because the header's "Lưu"
// button sits outside this panel and submits the same form.
export const ProductInfoTab = withForm({
  defaultValues: updateProductFormDefaultValues,
  props: {
    isSaving: false,
    selectedClient: undefined as ComboboxOption | undefined,
  },
  render: function Render({ form, isSaving, selectedClient }) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (form.state.isSubmitting) return
          form.handleSubmit()
        }}
        noValidate
      >
        <UpdateProductInfoSection
          form={form}
          disabled={isSaving}
          selectedClient={selectedClient}
        />
      </form>
    )
  },
})
