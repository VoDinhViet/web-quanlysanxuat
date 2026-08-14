import { useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FileText, Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { PurchaseRequestCreateHeaderSection } from "@/features/purchase-requests/components/create/PurchaseRequestCreateHeaderSection"
import { PurchaseRequestCreateItemsSection } from "@/features/purchase-requests/components/create/PurchaseRequestCreateItemsSection"
import { PurchaseRequestCreateSummaryCard } from "@/features/purchase-requests/components/create/PurchaseRequestCreateSummaryCard"
import { createPurchaseRequest } from "@/features/purchase-requests/api/server-functions/create-purchase-request.api"
import {
  createPurchaseRequestFormDefaultValues,
  createPurchaseRequestSchema,
} from "@/features/purchase-requests/schemas/create-purchase-request.schema"
import type { CreatePurchaseRequestSchema } from "@/features/purchase-requests/schemas/create-purchase-request.schema"

export function PurchaseRequestCreateForm() {
  const navigate = useNavigate({ from: "/manage/purchase-requests/create" })
  const queryClient = useQueryClient()
  const createPurchaseRequestFn = useServerFn(createPurchaseRequest)

  const { draft, saveDraft, clearDraft } =
    useFormDraft<CreatePurchaseRequestSchema>(
      "qlsx:draft:create-purchase-request"
    )
  const draftRestoredRef = useRef(false)

  // Trả về {id} (khác createOrder/createInventoryReceipt trả void) — điều hướng thẳng sang
  // trang chi tiết vừa tạo thay vì quay về danh sách, theo quyết định đã chốt với user.
  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreatePurchaseRequestSchema) =>
      createPurchaseRequestFn({ data: value }),
    onSuccess: async ({ id }) => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["purchase-requests"] })
      toast.success("Đã tạo đề xuất mua hàng")
      await navigate({
        to: "/manage/purchase-requests/$purchaseRequestId",
        params: { purchaseRequestId: id },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createPurchaseRequestFormDefaultValues,
    validators: {
      onSubmit: createPurchaseRequestSchema,
    },
    onSubmit: ({ value }) => create(value),
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="overflow-hidden rounded-lg bg-card shadow-card">
          <PurchaseRequestCreateHeaderSection
            form={form}
            disabled={isPending}
          />

          <div className="border-t border-border">
            <PurchaseRequestCreateItemsSection
              form={form}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="sticky top-6 h-fit rounded-lg bg-card p-4 shadow-card sm:p-5">
          <PurchaseRequestCreateSummaryCard form={form} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-card px-4 py-4 shadow-card sm:px-5">
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          disabled={isPending}
          onClick={() =>
            void navigate({
              to: "/manage/purchase-requests",
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
              restoreFormDraft(form, createPurchaseRequestFormDefaultValues)
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
                    Tạo đề xuất
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
