import { LinkButton, Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type NcrCreateSummaryCardProps = {
  typeLabel: string
  itemLabel: string | undefined
  orderCode: string | undefined
  clientName: string | undefined
  ngQtyLabel: string | undefined
  isPending: boolean
}

// Read-only recap of what will be created, with the page's two actions — sticks to the top
// of the right column on wide screens.
export function NcrCreateSummaryCard({
  typeLabel,
  itemLabel,
  orderCode,
  clientName,
  ngQtyLabel,
  isPending,
}: NcrCreateSummaryCardProps) {
  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-xs xl:sticky xl:top-4">
      <div className="border-b border-border px-4 py-3.5 sm:px-5">
        <h2 className="font-heading text-sm font-medium text-foreground">
          Tóm tắt NCR
        </h2>
      </div>
      <dl className="space-y-3 p-4 sm:p-5">
        <SummaryRow label="Loại NCR" value={typeLabel} />
        <SummaryRow label="Sản phẩm" value={itemLabel} />
        <SummaryRow label="Đơn hàng" value={orderCode} />
        <SummaryRow label="Khách hàng" value={clientName} />
        <SummaryRow label="SL hàng lỗi" value={ngQtyLabel} />
      </dl>
      <div className="flex justify-end gap-2 border-t border-border px-4 py-3.5 sm:px-5">
        <LinkButton
          to="/manage/ncrs"
          search={{ page: 1, limit: 10 }}
          variant="outline"
        >
          Hủy
        </LinkButton>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Đang tạo..." : "Tạo NCR"}
        </Button>
      </div>
    </section>
  )
}

type SummaryRowProps = {
  label: string
  value: string | undefined
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-sm",
          value ? "font-medium text-foreground" : "text-muted-foreground"
        )}
      >
        {value ?? "Chưa chọn"}
      </dd>
    </div>
  )
}
