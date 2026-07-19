import { Activity, useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertOctagon, FileText, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
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
  const queryClient = useQueryClient()
  const createSupplierFn = useServerFn(createSupplier)

  const { draft, saveDraft, clearDraft } = useFormDraft<CreateSupplierSchema>(
    "qlsx:draft:create-supplier"
  )
  const draftRestoredRef = useRef(false)

  const createSupplierMutation = useMutation({
    mutationFn: (value: CreateSupplierSchema) =>
      createSupplierFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] })
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
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
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                form.reset()
                restoreFormDraft(form, CREATE_SUPPLIER_DEFAULT_VALUES)
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
                      Lưu nhà cung cấp
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
