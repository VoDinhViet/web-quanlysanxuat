import { Activity } from "react"
import { DateTime } from "luxon"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertOctagon, Loader2, Save } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { SupplierInfoSection } from "@/features/suppliers/components/SupplierInfoSection"
import { SupplierOtherSection } from "@/features/suppliers/components/SupplierOtherSection"
import { SupplierPaymentSection } from "@/features/suppliers/components/SupplierPaymentSection"
import { supplierFormSchema } from "@/features/suppliers/schemas/supplier-form.schema"
import { updateSupplier } from "@/features/suppliers/server-functions/update-supplier"
import type { SupplierFormSchema } from "@/features/suppliers/schemas/supplier-form.schema"
import type {
  CountryRef,
  Supplier,
  SupplierGroupRef,
} from "@/features/suppliers/types/supplier.type"

// Supplier → raw form values: nullable fields become "", numbers/dates become
// the strings the payment section's inputs work with. `representatives` is
// flattened to its primary (or first) entry — the form only has flat
// representativeName/representativePhone fields today (a known gap, see the
// update-page plan), so anything beyond one representative isn't editable yet.
function buildSupplierDefaultValues(supplier: Supplier): SupplierFormSchema {
  const { payment } = supplier
  const primaryRepresentative =
    supplier.representatives.find((rep) => rep.isPrimary) ??
    supplier.representatives.at(0)

  return {
    name: supplier.name,
    supplierGroupId: supplier.group.id,
    type: supplier.type,
    taxCode: supplier.taxCode,
    phoneNumber: supplier.phoneNumber,
    email: supplier.email ?? "",
    representativeName: primaryRepresentative?.name ?? "",
    representativePhone: primaryRepresentative?.phoneNumber ?? "",
    address: supplier.address,
    note: supplier.note ?? "",
    logo: supplier.logo,
    countryId: supplier.country?.id ?? "",
    status: supplier.status,
    internalNote: supplier.internalNote ?? "",
    attachments: supplier.attachments.map((attachment) => ({
      id: attachment.file.id,
      url: attachment.file.url,
      originalName: attachment.file.originalName,
    })),
    payment: {
      bankName: payment.bankName ?? "",
      bankAccountNumber: payment.bankAccountNumber ?? "",
      bankAccountHolder: payment.bankAccountHolder ?? "",
      bankBranch: payment.bankBranch ?? "",
      defaultPaymentMethod: payment.defaultPaymentMethod ?? "",
      defaultPaymentTerm: payment.defaultPaymentTerm ?? "",
      creditLimit:
        payment.creditLimit != null ? String(payment.creditLimit) : "",
      creditLimitStartDate: payment.creditLimitStartDate
        ? DateTime.fromISO(payment.creditLimitStartDate).toFormat("yyyy-MM-dd")
        : "",
    },
  }
}

type UpdateSupplierFormProps = {
  supplier: Supplier
  supplierGroupOptions: SupplierGroupRef[]
  countryOptions: CountryRef[]
}

export function UpdateSupplierForm({
  supplier,
  supplierGroupOptions,
  countryOptions,
}: UpdateSupplierFormProps) {
  const navigate = useNavigate({ from: "/manage/suppliers/$supplierId/update" })
  const queryClient = useQueryClient()
  const updateSupplierFn = useServerFn(updateSupplier)

  const {
    mutate: update,
    isPending,
    error,
  } = useMutation({
    mutationFn: (value: SupplierFormSchema) =>
      updateSupplierFn({ data: { ...value, supplierId: supplier.id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] })
      await navigate({
        to: "/manage/suppliers",
        search: { page: 1, limit: 10 },
      })
    },
  })

  const form = useAppForm({
    defaultValues: buildSupplierDefaultValues(supplier),
    validators: {
      onSubmit: supplierFormSchema,
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

      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <SupplierInfoSection
          form={form}
          disabled={isPending}
          supplierGroupOptions={supplierGroupOptions}
          countryOptions={countryOptions}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <SupplierPaymentSection form={form} disabled={isPending} />
          <SupplierOtherSection form={form} disabled={isPending} />
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
