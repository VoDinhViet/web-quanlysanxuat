import { DateTime } from "luxon"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { UpdateSupplierInfoSection } from "@/features/suppliers/components/sections/UpdateSupplierInfoSection"
import { UpdateSupplierOtherSection } from "@/features/suppliers/components/sections/UpdateSupplierOtherSection"
import { UpdateSupplierPaymentSection } from "@/features/suppliers/components/sections/UpdateSupplierPaymentSection"
import { updateSupplierSchema } from "@/features/suppliers/schemas/update-supplier.schema"
import { updateSupplier } from "@/features/suppliers/api/server-functions/update-supplier.api"
import type { UpdateSupplierSchema } from "@/features/suppliers/schemas/update-supplier.schema"
import { getPrimaryRepresentative } from "@/lib/types/supplier.type"
import type { Supplier } from "@/lib/types/supplier.type"

// Supplier → raw form values: nullable fields become "", dates become the
// yyyy-MM-dd strings the date picker works with. `representatives` is
// flattened to its primary (or first) entry — the form only has flat
// representativeName/representativePhone fields today (a known gap, see the
// update-page plan), so anything beyond one representative isn't editable yet.
export function getSupplierDefaultValues(
  supplier: Supplier
): UpdateSupplierSchema {
  const { payment } = supplier
  const primaryRepresentative = getPrimaryRepresentative(
    supplier.representatives
  )

  return {
    supplierId: supplier.id,
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
    files: supplier.files.map((supplierFile) => supplierFile.file),
    payment: {
      bankName: payment.bankName ?? "",
      bankAccountNumber: payment.bankAccountNumber ?? "",
      bankAccountHolder: payment.bankAccountHolder ?? "",
      bankBranch: payment.bankBranch ?? "",
      defaultPaymentMethod: payment.defaultPaymentMethod ?? "",
      defaultPaymentTerm: payment.defaultPaymentTerm ?? "",
      creditLimit: payment.creditLimit ?? undefined,
      creditLimitStartDate: payment.creditLimitStartDate
        ? DateTime.fromISO(payment.creditLimitStartDate).toFormat("yyyy-MM-dd")
        : "",
    },
  }
}

type UpdateSupplierFormProps = {
  supplier: Supplier
}

export function UpdateSupplierForm({ supplier }: UpdateSupplierFormProps) {
  const navigate = useNavigate({ from: "/manage/suppliers/$supplierId/update" })
  const queryClient = useQueryClient()
  const updateSupplierFn = useServerFn(updateSupplier)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateSupplierSchema) =>
      updateSupplierFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] })
      await navigate({
        to: "/manage/suppliers",
        search: { page: 1, limit: 10 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getSupplierDefaultValues(supplier),
    validators: {
      onSubmit: updateSupplierSchema,
    },
    onSubmit: ({ value }) => update(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
      className="space-y-6"
    >
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <UpdateSupplierInfoSection form={form} disabled={isPending} />

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <UpdateSupplierPaymentSection form={form} disabled={isPending} />
          <UpdateSupplierOtherSection form={form} disabled={isPending} />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="outline"
            isDisabled={isPending}
            onPress={() =>
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
                isDisabled={!canSubmit || isSubmitting || isPending}
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
