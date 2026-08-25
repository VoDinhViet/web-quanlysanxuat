import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AltArrowLeft, AltArrowRight, CheckCircle } from "@solar-icons/react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { CreateOutsourcingReceiptConfirmSection } from "@/features/outsourcing-receipts/components/create/CreateOutsourcingReceiptConfirmSection"
import { CreateOutsourcingReceiptItemsSection } from "@/features/outsourcing-receipts/components/create/CreateOutsourcingReceiptItemsSection"
import { CreateOutsourcingReceiptPickerSection } from "@/features/outsourcing-receipts/components/create/CreateOutsourcingReceiptPickerSection"
import {
  CreateOutsourcingReceiptTabs,
  wizardTabs,
} from "@/features/outsourcing-receipts/components/create/CreateOutsourcingReceiptTabs"
import { createOutsourcingReceipt } from "@/features/outsourcing-receipts/api/server-functions/create-outsourcing-receipt.api"
import {
  createOutsourcingReceiptFormDefaultValues,
  createOutsourcingReceiptSchema,
} from "@/features/outsourcing-receipts/schemas/create-outsourcing-receipt.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { useAutoFocusFirstField } from "@/hooks/use-autofocus-first-field"
import type { CreateOutsourcingReceiptWizardTab } from "@/features/outsourcing-receipts/components/create/CreateOutsourcingReceiptTabs"

// Vỏ wizard "Nhập hàng gia công về" (OS-IN) — rập khuôn CreateOutsourcingOrderForm.tsx, 3 tab.
// POST /outsourcing-receipts trả về void (không có mã phiếu để hiện lại), nên không có dialog
// thành công — chỉ toast rồi điều hướng thẳng về danh sách, cùng pattern
// InventoryReceiptCreateFromPoForm.tsx (POST không trả dữ liệu hữu ích để dừng lại xem).
export function CreateOutsourcingReceiptForm() {
  const navigate = useNavigate({ from: "/manage/outsourcing-receipts/create" })
  const queryClient = useQueryClient()
  const createOutsourcingReceiptFn = useServerFn(createOutsourcingReceipt)

  const [tab, setTab] = useState<CreateOutsourcingReceiptWizardTab>("picker")

  const { mutate: create, isPending } = useMutation({
    mutationFn: createOutsourcingReceiptFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["outsourcing-receipts"],
      })
      toast.success("Đã tạo phiếu nhập gia công ngoài (OS-IN)")
      await navigate({
        to: "/manage/outsourcing-receipts",
        search: { page: 1, limit: 10 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createOutsourcingReceiptFormDefaultValues,
    validators: {
      onSubmit: createOutsourcingReceiptSchema,
    },
    onSubmit: ({ value }) => create({ data: value }),
  })

  // Radix widens onValueChange to `string`; `find` narrows it back without a cast, and an
  // unrecognised value simply doesn't switch tabs.
  function handleTabChange(value: string) {
    const nextTab = wizardTabs.find((item) => item.value === value)

    if (nextTab) {
      setTab(nextTab.value)
    }
  }

  const tabIndex = wizardTabs.findIndex((t) => t.value === tab)
  const prevTab = tabIndex > 0 ? wizardTabs[tabIndex - 1] : undefined
  const nextTab =
    tabIndex < wizardTabs.length - 1 ? wizardTabs[tabIndex + 1] : undefined

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
    >
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <Tabs value={tab} onValueChange={handleTabChange} className="gap-0">
          <form.Subscribe
            selector={(state) => ({
              hasItems: state.values.items.length > 0,
              hasReceiptInfo: Boolean(
                state.values.supplierId && state.values.receiptDate
              ),
            })}
          >
            {({ hasItems, hasReceiptInfo }) => (
              <CreateOutsourcingReceiptTabs
                canGoToItems={hasItems}
                canGoToConfirm={hasItems && hasReceiptInfo}
              />
            )}
          </form.Subscribe>

          <TabsContent value="picker" className="m-0 outline-none">
            <CreateOutsourcingReceiptPickerSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="items" className="m-0 outline-none">
            <CreateOutsourcingReceiptItemsSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="confirm" className="m-0 outline-none">
            <CreateOutsourcingReceiptConfirmSection form={form} />
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
          {prevTab ? (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              disabled={isPending}
              onClick={() => setTab(prevTab.value)}
            >
              <AltArrowLeft className="size-4" />
              Quay lại
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              disabled={isPending}
              onClick={() =>
                void navigate({
                  to: "/manage/outsourcing-receipts",
                  search: { page: 1, limit: 10 },
                })
              }
            >
              Hủy
            </Button>
          )}

          {nextTab ? (
            <form.Subscribe
              selector={(state) => ({
                hasItems: state.values.items.length > 0,
                hasReceiptInfo: Boolean(
                  state.values.supplierId && state.values.receiptDate
                ),
              })}
            >
              {({ hasItems, hasReceiptInfo }) => {
                const canAdvance =
                  tab === "picker" ? hasItems : hasItems && hasReceiptInfo

                return (
                  <Button
                    type="button"
                    disabled={!canAdvance}
                    onClick={() => setTab(nextTab.value)}
                  >
                    Tiếp theo: {nextTab.label}
                    <AltArrowRight className="size-4" />
                  </Button>
                )
              }}
            </form.Subscribe>
          ) : (
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button
                  type="button"
                  disabled={!canSubmit || isSubmitting || isPending}
                  onClick={() => {
                    if (form.state.isSubmitting) return
                    form.handleSubmit()
                  }}
                >
                  {isSubmitting || isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Đang tạo phiếu
                    </>
                  ) : (
                    <>
                      <CheckCircle className="size-4" />
                      Xác nhận nhập
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          )}
        </div>
      </div>
    </form>
  )
}
