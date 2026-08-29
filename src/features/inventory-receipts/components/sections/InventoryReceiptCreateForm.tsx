import { useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { useAutoFocusFirstField } from "@/hooks/use-autofocus-first-field"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { InventoryReceiptCreateHeaderSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateHeaderSection"
import { InventoryReceiptCreateItemsSection } from "@/features/inventory-receipts/components/sections/InventoryReceiptCreateItemsSection"
import { createInventoryReceipt } from "@/features/inventory-receipts/api/server-functions/create-inventory-receipt.api"
import {
  createInventoryReceiptFormDefaultValues,
  createInventoryReceiptSchema,
} from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"
import type { CreateInventoryReceiptSchema } from "@/features/inventory-receipts/schemas/create-inventory-receipt.schema"

// createInventoryReceipt trả void (không trả entity vừa tạo — quy ước chung cho API
// thêm/sửa/xoá) nên không có id để điều hướng sang trang chi tiết; onSuccess quay về danh
// sách, cùng cách CreateOrderForm.tsx làm.
export function InventoryReceiptCreateForm() {
  const navigate = useNavigate({ from: "/manage/inventory-receipts/create" })
  const queryClient = useQueryClient()
  const createInventoryReceiptFn = useServerFn(createInventoryReceipt)

  const { draft, saveDraft, clearDraft } =
    useFormDraft<CreateInventoryReceiptSchema>(
      "qlsx:draft:create-inventory-receipt-v2"
    )
  const draftRestoredRef = useRef(false)

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateInventoryReceiptSchema) =>
      createInventoryReceiptFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["inventory-receipts"] })
      toast.success("Đã tạo phiếu nhập kho")
      await navigate({
        to: "/manage/inventory-receipts",
        search: { page: 1, limit: 10 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createInventoryReceiptFormDefaultValues,
    validators: {
      onSubmit: createInventoryReceiptSchema,
    },
    onSubmit: ({ value }) => create(value),
  })

  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      restoreFormDraft(form, draft)
    }
  }, [draft, form])

  const formRef = useAutoFocusFirstField<HTMLFormElement>()

  return (
    <form
      ref={formRef}
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
        <InventoryReceiptCreateHeaderSection form={form} disabled={isPending} />

        <div className="border-t border-border">
          <InventoryReceiptCreateItemsSection
            form={form}
            disabled={isPending}
          />
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
              to: "/manage/inventory-receipts",
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
              restoreFormDraft(form, createInventoryReceiptFormDefaultValues)
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
                    Tạo phiếu nhập kho
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
