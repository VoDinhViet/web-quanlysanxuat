import { useQuery } from "@tanstack/react-query"
import { Boxes, Building2, CalendarDays, ClipboardList } from "lucide-react"
import { DateTime } from "luxon"

import { ScrollArea } from "@/components/ui/scroll-area"
import { withForm } from "@/hooks/use-app-form"
import { departmentQueryOptions } from "@/features/departments/api"
import { createPurchaseRequestFormDefaultValues } from "@/features/purchase-requests/schemas/create-purchase-request.schema"

// Above this many picked lines, the list caps its height and scrolls instead of growing forever
// (see the ScrollArea usage below). Below it, the list just renders at its natural height — a
// fixed-height ScrollArea on a short list leaves dead space under the last row, which looks as
// broken as the empty state we already fixed once.
const scrollableItemCountThreshold = 6

// Signature element of the create-purchase-request page: a running "phiếu tạm" styled after a
// real phiếu kho — an icon-badge letterhead with its own preprinted "Số" field, ruled/numbered
// lines once vật tư are picked (the `before:*` perforation rule separates the line-number gutter
// from content, the way a printed docket numbers its rows), and a double-ruled "Cộng" total line
// closing the itemized part, same as a paper form's own subtotal rule. Before anything is picked
// it reads as an empty tray (icon + copy), not a row of dashes pretending to be data — see
// "Treat emptiness as an invitation to act" in the frontend-design skill. It fills in as vật tư
// are picked on tab 1 and quantities are typed on tab 2 — unchanged across both tabs, which is
// what makes the 2-tab wizard read as one phiếu instead of two separate screens.
export const PurchaseRequestCreateTallySheet = withForm({
  defaultValues: createPurchaseRequestFormDefaultValues,
  props: {},
  render: function Render({ form }) {
    const { data: departments = [] } = useQuery(departmentQueryOptions())

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ClipboardList className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Phiếu tạm
            </h2>
            <p className="text-sm text-muted-foreground">
              Xem lại trước khi tạo
            </p>
          </div>
          <span className="shrink-0 font-mono text-[11px] tracking-wide text-muted-foreground">
            Số <span className="text-foreground">—</span>
          </span>
        </div>

        {/* Bare-array selector: `state.values.items` is reference-stable across unrelated store
            notifications (department/date field ticks, isTouched/canSubmit recomputes), so this
            subtree only re-renders when the picked lines actually change. */}
        <form.Subscribe selector={(state) => state.values.items}>
          {(items) => {
            if (items.length === 0) {
              return (
                <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
                  <Boxes className="size-7 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">
                    Chưa chọn vật tư nào
                  </p>
                  <p className="max-w-56 text-xs text-muted-foreground">
                    Sang tab “Chọn vật tư” để bắt đầu.
                  </p>
                </div>
              )
            }

            const list = (
              <ul className="divide-y divide-dashed divide-border/70">
                {items.map((item, index) => (
                  <li key={item.itemId} className="flex items-start gap-3 py-3">
                    <span className="w-9 shrink-0 pt-0.5 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1 border-l border-primary/20 pl-3">
                      <p className="text-xs font-medium text-foreground">
                        {item.itemName}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-mono text-[10px] text-muted-foreground">
                          {item.itemCode}
                        </span>
                        <span className="shrink-0 text-right text-xs font-medium text-foreground tabular-nums">
                          {item.quantity || "—"}{" "}
                          <span className="text-muted-foreground">
                            {item.itemUnit}
                          </span>
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )

            return (
              <>
                {/* Only past the threshold does the rail need to cap height and scroll — this
                    rail is sticky, so an unbounded list would push Cộng/Phòng ban/Ngày cần hàng
                    off the bottom of the viewport. Radix's ScrollArea viewport is `size-full`,
                    so it needs a definite (not max-) height to resolve against — a `max-h-*` on
                    the Root leaves the viewport unbounded and overlapping the rail's own footer,
                    which is why this is a fixed `h-72` gated behind the threshold rather than an
                    always-on `max-h-72`. */}
                {items.length > scrollableItemCountThreshold ? (
                  <ScrollArea className="h-72">{list}</ScrollArea>
                ) : (
                  list
                )}

                <div className="flex items-center justify-between border-t-[3px] border-double border-border pt-3">
                  <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Cộng
                  </span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {items.length} dòng
                  </span>
                </div>
              </>
            )
          }}
        </form.Subscribe>

        <form.Subscribe
          selector={(state) => ({
            departmentId: state.values.departmentId,
            neededDate: state.values.neededDate,
          })}
        >
          {({ departmentId, neededDate }) => {
            const department = departments.find((d) => d.id === departmentId)
            const neededDateLabel =
              neededDate.length > 0
                ? DateTime.fromISO(neededDate).toFormat("dd/MM/yyyy")
                : "—"

            return (
              <dl className="space-y-3 border-t border-border pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="size-3.5" />
                    Phòng ban
                  </dt>
                  <dd className="font-medium text-foreground">
                    {department?.name ?? "Chưa chọn"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    Ngày cần hàng
                  </dt>
                  <dd className="font-medium text-foreground">
                    {neededDateLabel}
                  </dd>
                </div>
              </dl>
            )
          }}
        </form.Subscribe>
      </div>
    )
  },
})
