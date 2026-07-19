import { Activity, useEffect, useRef } from "react"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { AlertOctagon, FileText, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { CreateProductInfoSection } from "@/features/products/components/CreateProductInfoSection"
import {
  CREATE_PRODUCT_DEFAULT_VALUES,
  createProductSchema,
} from "@/features/products/schemas/create-product.schema"
import { createProduct } from "@/features/products/server-functions/create-product"
import type { CreateProductSchema } from "@/features/products/schemas/create-product.schema"
import type { ProductFilterOption } from "@/features/products/types/product.type"

type CreateProductFormProps = {
  unitOptions: ProductFilterOption[]
  productGroupOptions: ProductFilterOption[]
  clientOptions: ProductFilterOption[]
}

export function CreateProductForm({
  unitOptions,
  productGroupOptions,
  clientOptions,
}: CreateProductFormProps) {
  const navigate = useNavigate({ from: "/manage/products/create" })
  const router = useRouter()
  const createProductFn = useServerFn(createProduct)

  const { draft, saveDraft, clearDraft } = useFormDraft<CreateProductSchema>(
    "qlsx:draft:create-product"
  )
  const draftRestoredRef = useRef(false)

  const createProductMutation = useMutation({
    mutationFn: (value: CreateProductSchema) =>
      createProductFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await router.invalidate()
      await navigate({
        to: "/manage/products",
        search: { page: 1, limit: 10 },
      })
    },
  })

  const isPending = createProductMutation.isPending
  const error = createProductMutation.error?.message ?? null

  const form = useAppForm({
    defaultValues: CREATE_PRODUCT_DEFAULT_VALUES,
    validators: {
      onSubmit: createProductSchema,
    },
    onSubmit: ({ value }) => createProductMutation.mutate(value),
  })

  // Auto-restore a saved draft into the form once, after localStorage hydrates.
  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      restoreFormDraft(form, draft)
    }
  }, [draft, form])

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
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      </Activity>

      <div className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <CreateProductInfoSection
          form={form}
          disabled={isPending}
          unitOptions={unitOptions}
          productGroupOptions={productGroupOptions}
          clientOptions={clientOptions}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
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
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                form.reset()
                restoreFormDraft(form, CREATE_PRODUCT_DEFAULT_VALUES)
                clearDraft()
              }}
            >
              <RotateCcw className="size-4" />
              Đặt lại
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                saveDraft(form.state.values)
                toast.success("Đã lưu nháp")
              }}
            >
              <FileText className="size-4" />
              Lưu nháp
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
                      Lưu sản phẩm
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </div>
    </form>
  )
}
