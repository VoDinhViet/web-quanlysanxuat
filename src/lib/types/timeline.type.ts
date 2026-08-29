// Shared by every detail page with an approval/lifecycle timeline (orders, purchase-orders,
// purchase-quotations, payment-requests) — each domain's own `logic/*-timeline.ts` builder
// returns this same step shape from its own real fields (createdAt/creator, approvedAt/
// approver, rejectedAt/rejecter, ...), no mock data. Previously declared four times over
// (once per domain type file, each citing "domain types don't cross features" as the reason
// not to share) — that reasoning is about `src/features/*` not importing each other, not
// about `src/lib/types/*.type.ts` files, which already is the sanctioned place for a shape
// shared across domains. The builders themselves (`build*Timeline`) stay per-feature — their
// comments document genuinely divergent lifecycle rules, only this output shape is common.
export type TimelineStepState = "done" | "current" | "upcoming" | "cancelled"

export type TimelineStep = {
  key: string
  label: string
  state: TimelineStepState
  timestamp: string | null
  actor: string | null
  detail: string | null
}
