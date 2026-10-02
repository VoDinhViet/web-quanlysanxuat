import { useCallback, useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ArrowRight, Box, CheckCircle } from "@solar-icons/react"
import { toast } from "sonner"
import type { ReactElement } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { createPurchaseRequestItems } from "@/features/purchase-requests/api/server-functions/create-purchase-request-items.api"
import { CreatePurchaseRequestItemsDetailsTable } from "@/features/purchase-requests/components/composites/CreatePurchaseRequestItemsDetailsTable"
import type { PurchaseRequestItemDraft } from "@/features/purchase-requests/components/composites/CreatePurchaseRequestItemsDetailsTable"
import { CreatePurchaseRequestItemsPicker } from "@/features/purchase-requests/components/composites/CreatePurchaseRequestItemsPicker"
import {
  CreatePurchaseRequestItemsStepsTabs,
  createPurchaseRequestItemsStepItems,
} from "@/features/purchase-requests/components/composites/CreatePurchaseRequestItemsStepsTabs"
import type { CreatePurchaseRequestItemsStep } from "@/features/purchase-requests/components/composites/CreatePurchaseRequestItemsStepsTabs"
import { getStepNav } from "@/lib/wizard-steps"
import type { Direct } from "@/lib/types/direct.type"
import type { PurchaseRequestDetail } from "@/lib/types/purchase-request.type"

type CreatePurchaseRequestItemsDialogProps = {
  purchaseRequest: PurchaseRequestDetail
  trigger: ReactElement
}

// Adds one or many items to this purchase request (DRAFT/REJECTED — backend flips REJECTED back to
// DRAFT), same 2-step flow as the Job's "Thêm vật tư": ① pick from a searchable table, ② enter
// quantities. An item already on the request is locked in step 1; use "Sửa" on its row instead.
export function CreatePurchaseRequestItemsDialog({
  purchaseRequest,
  trigger,
}: CreatePurchaseRequestItemsDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const createItemsFn = useServerFn(createPurchaseRequestItems)

  const { mutate: createItems, isPending } = useMutation({
    mutationFn: (drafts: PurchaseRequestItemDraft[]) =>
      createItemsFn({
        data: {
          purchaseRequestId: purchaseRequest.id,
          items: drafts.map((draft) => ({
            itemId: draft.direct.id,
            quantity: draft.quantity ?? 0,
          })),
        },
      }),
    onSuccess: async (_data, drafts) => {
      setOpen(false)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["purchase-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
      ])
      toast.success(`Đã thêm ${drafts.length} vật tư vào đề xuất`)
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[88vh] overflow-y-auto shadow-lg ring-0 sm:max-w-4xl">
        {/* `key` remounts on every open — resets the step and any half-done selection. */}
        <CreatePurchaseRequestItemsWizard
          key={open ? "open" : "closed"}
          purchaseRequest={purchaseRequest}
          onSubmit={createItems}
          onCancel={() => setOpen(false)}
          isSaving={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

type CreatePurchaseRequestItemsWizardProps = {
  purchaseRequest: PurchaseRequestDetail
  onSubmit: (drafts: PurchaseRequestItemDraft[]) => void
  onCancel: () => void
  isSaving: boolean
}

function CreatePurchaseRequestItemsWizard({
  purchaseRequest,
  onSubmit,
  onCancel,
  isSaving,
}: CreatePurchaseRequestItemsWizardProps) {
  const [step, setStep] = useState<CreatePurchaseRequestItemsStep>("select")
  // Single source for both the selection (step 1) and the quantities (step 2), keyed by itemId.
  const [picked, setPicked] = useState<Map<string, PurchaseRequestItemDraft>>(
    new Map()
  )
  const existingItemIds = new Set(
    purchaseRequest.items.map((line) => line.item.id)
  )

  const canGoToDetails = picked.size > 0
  const canSubmit =
    picked.size > 0 &&
    Array.from(picked.values()).every(
      (draft) => draft.quantity !== undefined && draft.quantity > 0
    )

  const { prevStep, prevLabel, nextStep, nextLabel } = getStepNav(
    createPurchaseRequestItemsStepItems,
    step
  )

  const toggleRow = useCallback((direct: Direct) => {
    setPicked((prev) => {
      const next = new Map(prev)
      if (next.has(direct.id)) {
        next.delete(direct.id)
      } else {
        next.set(direct.id, { direct, quantity: 1 })
      }
      return next
    })
  }, [])

  function removeRow(itemId: string) {
    setPicked((prev) => {
      const next = new Map(prev)
      next.delete(itemId)
      return next
    })
  }

  function changeQuantity(itemId: string, quantity: number | undefined) {
    setPicked((prev) => {
      const current = prev.get(itemId)
      if (!current) return prev
      const next = new Map(prev)
      next.set(itemId, { ...current, quantity })
      return next
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <DialogHeader className="gap-1">
        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
          <Box className="size-4 text-primary" />
          Thêm vật tư vào đề xuất {purchaseRequest.code}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Chọn một hoặc nhiều vật tư ở bước 1, rồi nhập số lượng đề xuất ở bước
          2. Vật tư đã có trong phiếu không chọn lại được — muốn đổi số lượng
          thì sửa dòng hiện có.
        </DialogDescription>
      </DialogHeader>

      <Tabs
        value={step}
        onValueChange={(value) => {
          const target = createPurchaseRequestItemsStepItems.find(
            (item) => item.value === value
          )
          if (target) setStep(target.value)
        }}
        className="gap-0"
      >
        <CreatePurchaseRequestItemsStepsTabs
          canGoToDetails={canGoToDetails}
          pickedCount={picked.size}
        />

        {/* keepMounted: the picker keeps its own page/search state across step 2 round trips. */}
        <TabsContent
          value="select"
          keepMounted
          className="m-0 pt-4 outline-none data-hidden:hidden"
        >
          <CreatePurchaseRequestItemsPicker
            disabled={isSaving}
            pickedIds={new Set(picked.keys())}
            existingItemIds={existingItemIds}
            onToggleRow={toggleRow}
          />
        </TabsContent>

        <TabsContent value="details" className="m-0 pt-4 outline-none">
          <CreatePurchaseRequestItemsDetailsTable
            items={Array.from(picked.values())}
            disabled={isSaving}
            onQuantityChange={changeQuantity}
            onRemove={removeRow}
          />
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between gap-2 pt-1">
        {prevStep ? (
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            disabled={isSaving}
            onClick={() => setStep(prevStep)}
          >
            <ArrowLeft className="size-4" />
            {prevLabel}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Thoát
          </Button>
        )}

        {nextStep ? (
          <Button
            type="button"
            disabled={isSaving || !canGoToDetails}
            onClick={() => setStep(nextStep)}
          >
            {nextLabel}
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            disabled={isSaving || !canSubmit}
            onClick={() => onSubmit(Array.from(picked.values()))}
          >
            <CheckCircle className="size-4" />
            {picked.size > 0 ? `Thêm ${picked.size} vật tư` : "Thêm vật tư"}
          </Button>
        )}
      </div>
    </div>
  )
}
