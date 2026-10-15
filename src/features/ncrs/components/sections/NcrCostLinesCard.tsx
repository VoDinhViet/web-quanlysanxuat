import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { Wallet } from "@solar-icons/react"
import { toast } from "sonner"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { saveNcrCostLines } from "@/features/ncrs/api/server-functions/save-ncr-cost-lines.api"
import {
  costLineGridClass,
  NcrCostLineRow,
} from "@/features/ncrs/components/composites/NcrCostLineRow"
import type { NcrCostLineDraft } from "@/features/ncrs/components/composites/NcrCostLineRow"
import { NcrSectionCard } from "@/features/ncrs/components/layouts/NcrSectionCard"
import { ncrCostKindLabels, NcrCostKind, NcrStatus } from "@/lib/types/ncr.type"
import type { NcrDetail } from "@/lib/types/ncr.type"
import { cn } from "@/lib/utils"

type NcrCostLinesCardProps = {
  ncr: NcrDetail
}

const currencyFormatter = new Intl.NumberFormat("vi-VN")
const kindBadgeVariants: Record<
  NcrCostKind,
  "info" | "success" | "violet" | "neutral"
> = {
  [NcrCostKind.MATERIAL]: "info",
  [NcrCostKind.LABOR]: "success",
  [NcrCostKind.OUTSOURCING]: "violet",
  [NcrCostKind.OTHER]: "neutral",
}

const columnHeaders = [
  { label: "Loại chi phí", className: "" },
  { label: "Diễn giải", className: "" },
  { label: "Số lượng", className: "text-right" },
  { label: "Đơn giá (đ)", className: "text-right" },
  { label: "Thành tiền (đ)", className: "text-right" },
]

function toDrafts(ncr: NcrDetail): NcrCostLineDraft[] {
  return ncr.costLines.map((line) => ({
    key: line.id,
    kind: line.kind,
    description: line.description,
    itemId: line.itemId,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
  }))
}

// Estimated cost lines (dự toán chi phí): the server recomputes `amount = quantity × unitPrice`
// on save, so the figures shown here are only a live preview.
export function NcrCostLinesCard({ ncr }: NcrCostLinesCardProps) {
  const queryClient = useQueryClient()
  const saveCostLinesFn = useServerFn(saveNcrCostLines)
  const [drafts, setDrafts] = useState(() => toDrafts(ncr))
  const isLocked = ncr.status === NcrStatus.CLOSED

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      saveCostLinesFn({
        data: {
          ncrId: ncr.id,
          lines: drafts.map((draft) => ({
            kind: draft.kind,
            description: draft.description.trim(),
            itemId: draft.itemId ?? undefined,
            quantity: draft.quantity,
            unitPrice: draft.unitPrice,
          })),
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["ncrs"] })
      toast.success("Đã lưu dự toán chi phí")
    },
    onError: (error) => toast.error(error.message),
  })

  const updateDraft = (key: string, patch: Partial<NcrCostLineDraft>) =>
    setDrafts((current) =>
      current.map((draft) =>
        draft.key === key ? { ...draft, ...patch } : draft
      )
    )

  const addDraft = () =>
    setDrafts((current) => [
      ...current,
      {
        key: crypto.randomUUID(),
        kind: NcrCostKind.OTHER,
        description: "",
        itemId: null,
        quantity: 1,
        unitPrice: 0,
      },
    ])

  const totalCost = drafts.reduce(
    (sum, draft) => sum + draft.quantity * draft.unitPrice,
    0
  )
  const subtotalByKind = drafts.reduce<Partial<Record<NcrCostKind, number>>>(
    (subtotals, draft) => ({
      ...subtotals,
      [draft.kind]:
        (subtotals[draft.kind] ?? 0) + draft.quantity * draft.unitPrice,
    }),
    {}
  )
  const usedKinds = Object.values(NcrCostKind).filter(
    (kind) => (subtotalByKind[kind] ?? 0) > 0
  )

  return (
    <NcrSectionCard
      icon={Wallet}
      tone="success"
      title="Dự toán chi phí"
      description="Vật tư, nhân công, gia công ngoài và chi phí khác của phương án xử lý"
      action={
        !isLocked && (
          <PermissionGate permission="ncr:update">
            <Button type="button" variant="outline" onClick={addDraft}>
              <Plus className="size-4" />
              Thêm dòng
            </Button>
          </PermissionGate>
        )
      }
    >
      <div className="space-y-4">
        {drafts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-foreground/70">
            Chưa có dòng dự toán nào. Bấm &quot;Thêm dòng&quot; để nhập vật tư,
            nhân công hoặc chi phí gia công ngoài.
          </p>
        ) : (
          <div className="space-y-3">
            <div
              className={cn(
                "hidden gap-x-2 px-0 text-xs font-medium text-foreground/70 sm:grid",
                costLineGridClass
              )}
            >
              {columnHeaders.map((column) => (
                <span key={column.label} className={column.className}>
                  {column.label}
                </span>
              ))}
              <span />
            </div>
            {drafts.map((draft) => (
              <NcrCostLineRow
                key={draft.key}
                draft={draft}
                isLocked={isLocked}
                onChange={(patch) => updateDraft(draft.key, patch)}
                onRemove={() =>
                  setDrafts((current) =>
                    current.filter((item) => item.key !== draft.key)
                  )
                }
              />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {usedKinds.map((kind) => (
              <Badge key={kind} variant={kindBadgeVariants[kind]}>
                {ncrCostKindLabels[kind]}{" "}
                {currencyFormatter.format(subtotalByKind[kind] ?? 0)}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm text-foreground/70">
              Tổng dự toán:{" "}
              <span className="text-base font-semibold text-foreground tabular-nums">
                {currencyFormatter.format(totalCost)} đ
              </span>
            </p>
            {!isLocked && (
              <PermissionGate permission="ncr:update">
                <Button
                  type="button"
                  disabled={isPending}
                  onClick={() => save()}
                >
                  {isPending ? "Đang lưu..." : "Lưu dự toán"}
                </Button>
              </PermissionGate>
            )}
          </div>
        </div>
      </div>
    </NcrSectionCard>
  )
}
