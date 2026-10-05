import { Textarea } from "@/components/ui/textarea"
import type { UsePurchaseRequestNoteResult } from "@/features/purchase-requests/hooks/use-purchase-request-note"

type PurchaseRequestNoteFieldProps = {
  note: string | null
  draft: UsePurchaseRequestNoteResult
}

export function PurchaseRequestNoteField({
  note,
  draft,
}: PurchaseRequestNoteFieldProps) {
  if (!draft.editable) {
    return (
      <div className="space-y-1">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Ghi chú
        </p>
        <p className="text-sm font-medium whitespace-pre-wrap text-foreground">
          {note ?? "—"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <label
        htmlFor="purchase-request-note"
        className="block text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
      >
        Ghi chú
      </label>
      <Textarea
        id="purchase-request-note"
        className="min-h-16 w-full resize-y bg-background text-sm"
        placeholder="Nhập ghi chú"
        maxLength={1000}
        disabled={draft.isPending}
        value={draft.value}
        onChange={(event) => draft.onChange(event.target.value)}
      />
    </div>
  )
}
