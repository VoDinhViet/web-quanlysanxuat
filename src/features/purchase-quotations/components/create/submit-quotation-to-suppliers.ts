import {
  buildQuotationPayload,
  collectQuotationSuppliers,
} from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"
import type {
  CreateQuotationFormSchema,
  CreateQuotationPayload,
} from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

export type QuotationSubmitOutcome =
  | { supplierLabel: string; ok: true }
  | { supplierLabel: string; ok: false; message: string }

// Fans out to one POST /purchase-quotations call per distinct supplier appearing across any
// item's quotes (collectQuotationSuppliers — see create-purchase-quotation.schema.ts's module
// comment for why one RFQ form can't submit as a single request) — Promise.allSettled so one
// supplier's failure (e.g. a stale/cancelled item) doesn't block the others from being created;
// there's no bulk-create endpoint to make this atomic anyway. Pulled out of CreateQuotationForm's
// mutationFn so the fan-out/error-collection logic has a name and can be read/tested on its own.
export async function submitQuotationToSuppliers(
  value: CreateQuotationFormSchema,
  createQuotation: (payload: CreateQuotationPayload) => Promise<void>
): Promise<QuotationSubmitOutcome[]> {
  const suppliers = collectQuotationSuppliers(value)

  const results = await Promise.allSettled(
    suppliers.map((supplier) =>
      createQuotation(buildQuotationPayload(value, supplier.supplierId))
    )
  )

  return results.map((result, index) => {
    const supplier = suppliers[index]
    const supplierLabel = supplier.supplierLabel || supplier.supplierId

    if (result.status === "fulfilled") {
      return { supplierLabel, ok: true }
    }

    const message =
      result.reason instanceof Error
        ? result.reason.message
        : "Lỗi không xác định"
    return { supplierLabel, ok: false, message }
  })
}

// Boils the per-supplier outcomes down to what CreateQuotationForm's onSuccess needs to decide
// its toast + whether to navigate away.
export function summarizeQuotationOutcomes(
  outcomes: QuotationSubmitOutcome[]
): {
  succeededCount: number
  failed: Extract<QuotationSubmitOutcome, { ok: false }>[]
} {
  return {
    succeededCount: outcomes.filter((outcome) => outcome.ok).length,
    failed: outcomes.filter(
      (outcome): outcome is Extract<QuotationSubmitOutcome, { ok: false }> =>
        !outcome.ok
    ),
  }
}
