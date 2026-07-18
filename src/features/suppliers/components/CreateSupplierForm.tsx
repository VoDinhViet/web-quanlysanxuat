import { Activity } from "react"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { AlertOctagon, Loader2, Save } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { CreateSupplierInfoSection } from "@/features/suppliers/components/CreateSupplierInfoSection"
import { CreateSupplierOtherSection } from "@/features/suppliers/components/CreateSupplierOtherSection"
import { CreateSupplierPaymentSection } from "@/features/suppliers/components/CreateSupplierPaymentSection"
import {
  CREATE_SUPPLIER_DEFAULT_VALUES,
  createSupplierSchema,
} from "@/features/suppliers/schemas/create-supplier.schema"
import { createSupplier } from "@/features/suppliers/server-functions/create-supplier"
import type { CreateSupplierSchema } from "@/features/suppliers/schemas/create-supplier.schema"
import type {
  CountryRef,
  SupplierGroupRef,
} from "@/features/suppliers/types/supplier.type"

type CreateSupplierFormProps = {
  supplierGroupOptions: SupplierGroupRef[]
  countryOptions: CountryRef[]
}

export function CreateSupplierForm({
  supplierGroupOptions,
  countryOptions,
}: CreateSupplierFormProps) {
  const navigate = useNavigate({ from: "/manage/suppliers/create" })
  const router = useRouter()
  const createSupplierFn = useServerFn(createSupplier)

  const createSupplierMutation = useMutation({
    mutationFn: (value: CreateSupplierSchema) =>
      createSupplierFn({ data: value }),
    onSuccess: async () => {
      await router.invalidate()
      await navigate({
        to: "/manage/suppliers",
        search: { page: 1, limit: 10 },
      })
    },
  })

  const isPending = createSupplierMutation.isPending
  const error = createSupplierMutation.error?.message ?? null

  const form = useAppForm({
    defaultValues: CREATE_SUPPLIER_DEFAULT_VALUES,
    validators: {
      onSubmit: createSupplierSchema,
    },
    onSubmit: ({ value }) => createSupplierMutation.mutate(value),
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
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      </Activity>

      <div className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <CreateSupplierInfoSection
          form={form}
          disabled={isPending}
          supplierGroupOptions={supplierGroupOptions}
          countryOptions={countryOptions}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <CreateSupplierPaymentSection form={form} disabled={isPending} />
          <CreateSupplierOtherSection form={form} disabled={isPending} />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              void navigate({
                to: "/manage/suppliers",
                search: { page: 1, limit: 10 },
              })
            }
          >
            Hủy
          </Button>
          <Button type="button" variant="outline">
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
                    Lưu nhà cung cấp
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
