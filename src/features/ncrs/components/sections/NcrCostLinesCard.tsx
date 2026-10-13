import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { saveNcrCostLines } from "@/features/ncrs/api/server-functions/save-ncr-cost-lines.api"
import { NcrSectionCard } from "@/features/ncrs/components/layouts/NcrSectionCard"
import { ncrCostKindLabels, NcrCostKind, NcrStatus } from "@/lib/types/ncr.type"
import type { NcrDetail } from "@/lib/types/ncr.type"
import { buildOptionsFromLabels } from "@/lib/utils"

type NcrCostLinesCardProps = {
  ncr: NcrDetail
}

// Editable cost line (the `id`/`amount` of a saved line are server-owned; `key` is only a React
// key for rows the user adds before saving).
type CostLineDraft = {
  key: string
  kind: NcrCostKind
  description: string
  itemId: string | null
  quantity: number
  unitPrice: number
}

const currencyFormatter = new Intl.NumberFormat("vi-VN")
const kindOptions = buildOptionsFromLabels(ncrCostKindLabels)

function toDrafts(ncr: NcrDetail): CostLineDraft[] {
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

  const updateDraft = (key: string, patch: Partial<CostLineDraft>) =>
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

  return (
    <NcrSectionCard
      title="Dự toán chi phí"
      description="Vật tư, nhân công, gia công ngoài và chi phí khác của phương án xử lý"
    >
      <div className="space-y-3">
        {drafts.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Chưa có dòng dự toán nào.
          </p>
        )}

        {drafts.map((draft) => (
          <div
            key={draft.key}
            className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[9rem_1fr_6rem_8rem_auto]"
          >
            <Select
              items={kindOptions}
              value={draft.kind}
              disabled={isLocked}
              onValueChange={(value) =>
                value !== null && updateDraft(draft.key, { kind: value })
              }
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {kindOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="col-span-2 text-xs sm:col-span-1"
              placeholder="Diễn giải"
              value={draft.description}
              disabled={isLocked}
              onChange={(event) =>
                updateDraft(draft.key, { description: event.target.value })
              }
            />
            <Input
              type="number"
              min={0}
              className="text-xs"
              placeholder="SL"
              value={draft.quantity}
              disabled={isLocked}
              onChange={(event) =>
                updateDraft(draft.key, {
                  quantity: Number(event.target.value),
                })
              }
            />
            <Input
              type="number"
              min={0}
              className="text-xs"
              placeholder="Đơn giá"
              value={draft.unitPrice}
              disabled={isLocked}
              onChange={(event) =>
                updateDraft(draft.key, {
                  unitPrice: Number(event.target.value),
                })
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Xóa dòng dự toán"
              disabled={isLocked}
              onClick={() =>
                setDrafts((current) =>
                  current.filter((item) => item.key !== draft.key)
                )
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <p className="text-sm">
            Tổng dự toán:{" "}
            <span className="font-semibold">
              {currencyFormatter.format(totalCost)} đ
            </span>
          </p>

          {!isLocked && (
            <PermissionGate permission="ncr:update">
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={addDraft}>
                  <Plus className="size-4" />
                  Thêm dòng
                </Button>
                <Button
                  type="button"
                  disabled={isPending}
                  onClick={() => save()}
                >
                  {isPending ? "Đang lưu..." : "Lưu dự toán"}
                </Button>
              </div>
            </PermissionGate>
          )}
        </div>
      </div>
    </NcrSectionCard>
  )
}
