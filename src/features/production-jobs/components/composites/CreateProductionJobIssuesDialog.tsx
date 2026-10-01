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
import { createProductionJobIssues } from "@/features/production-jobs/api/server-functions/create-production-job-issues.api"
import { CreateProductionJobIssuesDetailsTable } from "@/features/production-jobs/components/composites/CreateProductionJobIssuesDetailsTable"
import type { ProductionJobIssueDraft } from "@/features/production-jobs/components/composites/CreateProductionJobIssuesDetailsTable"
import {
  CreateProductionJobIssuesStepsTabs,
  createProductionJobIssuesStepItems,
} from "@/features/production-jobs/components/composites/CreateProductionJobIssuesStepsTabs"
import type { CreateProductionJobIssuesStep } from "@/features/production-jobs/components/composites/CreateProductionJobIssuesStepsTabs"
import { ProductionJobItemPickerTable } from "@/features/production-jobs/components/composites/ProductionJobItemPickerTable"
import type { ProductionJobItemPickerRow } from "@/features/production-jobs/components/composites/ProductionJobItemPickerColumns"
import { getStepNav } from "@/lib/wizard-steps"

type CreateProductionJobIssuesDialogProps = {
  productionJobId: string
  trigger: ReactElement
}

// Adds one or many items to this Job only (PENDING), same 2-step flow as the product BOM's
// "Thêm vật tư": ① pick from a searchable table, ② enter quantities. A item already on the
// Job is rejected by the backend; use "Sửa" on its row instead.
export function CreateProductionJobIssuesDialog({
  productionJobId,
  trigger,
}: CreateProductionJobIssuesDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const createLinesFn = useServerFn(createProductionJobIssues)

  const { mutate: createLines, isPending } = useMutation({
    mutationFn: (drafts: ProductionJobIssueDraft[]) =>
      createLinesFn({
        data: {
          productionJobId,
          items: drafts.map((draft) => ({
            itemId: draft.row.id,
            requiredQty: draft.quantity,
          })),
        },
      }),
    onSuccess: async (_data, drafts) => {
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["production-jobs"] })
      toast.success(`Đã thêm ${drafts.length} vật tư vào Job`)
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[88vh] overflow-y-auto shadow-lg ring-0 sm:max-w-4xl">
        {/* `key` remounts on every open — resets the step and any half-done selection. */}
        <CreateProductionJobIssuesWizard
          key={open ? "open" : "closed"}
          onSubmit={createLines}
          onCancel={() => setOpen(false)}
          isSaving={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

type CreateProductionJobIssuesWizardProps = {
  onSubmit: (drafts: ProductionJobIssueDraft[]) => void
  onCancel: () => void
  isSaving: boolean
}

function CreateProductionJobIssuesWizard({
  onSubmit,
  onCancel,
  isSaving,
}: CreateProductionJobIssuesWizardProps) {
  const [step, setStep] = useState<CreateProductionJobIssuesStep>("select")
  // Single source for both the selection (step 1) and the quantities (step 2), keyed by itemId.
  const [picked, setPicked] = useState<Map<string, ProductionJobIssueDraft>>(
    new Map()
  )

  const canGoToDetails = picked.size > 0
  const canSubmit =
    picked.size > 0 &&
    Array.from(picked.values()).every(
      (draft) => draft.quantity !== undefined && draft.quantity > 0
    )

  const { prevStep, prevLabel, nextStep, nextLabel } = getStepNav(
    createProductionJobIssuesStepItems,
    step
  )

  const toggleRow = useCallback((row: ProductionJobItemPickerRow) => {
    setPicked((prev) => {
      const next = new Map(prev)
      if (next.has(row.id)) {
        next.delete(row.id)
      } else {
        next.set(row.id, { row, quantity: 1 })
      }
      return next
    })
  }, [])

  const toggleAllRows = useCallback(
    (rows: ProductionJobItemPickerRow[], checked: boolean) => {
      setPicked((prev) => {
        const next = new Map(prev)
        rows.forEach((row) => {
          if (!checked) {
            next.delete(row.id)
          } else if (!next.has(row.id)) {
            next.set(row.id, { row, quantity: 1 })
          }
        })
        return next
      })
    },
    []
  )

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
          Thêm vật tư vào Job
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Chọn một hoặc nhiều vật tư ở bước 1, rồi nhập số lượng cần ở bước 2.
          Chỉ áp dụng cho Job này, không thay đổi cấu trúc sản phẩm.
        </DialogDescription>
      </DialogHeader>

      <Tabs
        value={step}
        onValueChange={(value) => {
          const target = createProductionJobIssuesStepItems.find(
            (item) => item.value === value
          )
          if (target) setStep(target.value)
        }}
        className="gap-0"
      >
        <CreateProductionJobIssuesStepsTabs
          canGoToDetails={canGoToDetails}
          pickedCount={picked.size}
        />

        {/* keepMounted: the picker keeps its own page/search state across step 2 round trips. */}
        <TabsContent
          value="select"
          keepMounted
          className="m-0 pt-4 outline-none data-hidden:hidden"
        >
          <ProductionJobItemPickerTable
            disabled={isSaving}
            pickedIds={new Set(picked.keys())}
            onToggleRow={toggleRow}
            onToggleAllRows={toggleAllRows}
          />
        </TabsContent>

        <TabsContent value="details" className="m-0 pt-4 outline-none">
          <CreateProductionJobIssuesDetailsTable
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
