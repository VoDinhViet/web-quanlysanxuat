import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AltArrowLeft, AltArrowRight, CheckCircle } from "@solar-icons/react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { CreateOutboundOrderConfirmSection } from "@/features/outbound-orders/components/create/CreateOutboundOrderConfirmSection"
import { CreateOutboundOrderItemsSection } from "@/features/outbound-orders/components/create/CreateOutboundOrderItemsSection"
import { CreateOutboundOrderPickerSection } from "@/features/outbound-orders/components/create/CreateOutboundOrderPickerSection"
import {
  CreateOutboundOrderTabs,
  wizardTabs,
} from "@/features/outbound-orders/components/create/CreateOutboundOrderTabs"
import { createOutboundOrder } from "@/features/outbound-orders/api/server-functions/create-outbound-order.api"
import {
  createOutboundOrderFormDefaultValues,
  createOutboundOrderSchema,
} from "@/features/outbound-orders/schemas/create-outbound-order.schema"
import { useAppForm } from "@/hooks/use-app-form"
import type { CreateOutboundOrderWizardTab } from "@/features/outbound-orders/components/create/CreateOutboundOrderTabs"

// Vỏ wizard "Tạo phiếu giao hàng" (DO) — rập khuôn CreateOutsourcingReceiptForm.tsx, 3 tab.
// POST /outbound-orders trả về void (không có mã phiếu để hiện lại), nên không có dialog thành
// công — chỉ toast rồi điều hướng thẳng về danh sách.
export function CreateOutboundOrderForm() {
  const navigate = useNavigate({ from: "/manage/outbound-orders/create" })
  const queryClient = useQueryClient()
  const createOutboundOrderFn = useServerFn(createOutboundOrder)

  const [tab, setTab] = useState<CreateOutboundOrderWizardTab>("picker")

  const { mutate: create, isPending } = useMutation({
    mutationFn: createOutboundOrderFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["outbound-orders"] })
      toast.success("Đã tạo phiếu giao hàng (DO)")
      await navigate({
        to: "/manage/outbound-orders",
        search: { page: 1, limit: 20 },
      })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createOutboundOrderFormDefaultValues,
    validators: {
      onSubmit: createOutboundOrderSchema,
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

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
    >
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <Tabs value={tab} onValueChange={handleTabChange} className="gap-0">
          <form.Subscribe
            selector={(state) => ({
              hasItems: state.values.items.length > 0,
              hasOrderInfo: Boolean(
                state.values.fulfillmentDate && state.values.fulfillmentType
              ),
            })}
          >
            {({ hasItems, hasOrderInfo }) => (
              <CreateOutboundOrderTabs
                canGoToItems={hasItems}
                canGoToConfirm={hasItems && hasOrderInfo}
              />
            )}
          </form.Subscribe>

          <TabsContent value="picker" className="m-0 outline-none">
            <CreateOutboundOrderPickerSection
              form={form}
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="items" className="m-0 outline-none">
            <CreateOutboundOrderItemsSection form={form} disabled={isPending} />
          </TabsContent>
          <TabsContent value="confirm" className="m-0 outline-none">
            <CreateOutboundOrderConfirmSection form={form} />
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
                  to: "/manage/outbound-orders",
                  search: { page: 1, limit: 20 },
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
                hasOrderInfo: Boolean(
                  state.values.fulfillmentDate && state.values.fulfillmentType
                ),
              })}
            >
              {({ hasItems, hasOrderInfo }) => {
                const canAdvance =
                  tab === "picker" ? hasItems : hasItems && hasOrderInfo

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
                  onClick={() => form.handleSubmit()}
                >
                  {isSubmitting || isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Đang tạo phiếu
                    </>
                  ) : (
                    <>
                      <CheckCircle className="size-4" />
                      Xác nhận tạo phiếu
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
