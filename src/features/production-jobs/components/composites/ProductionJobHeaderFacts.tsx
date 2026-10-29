import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { format, parseISO } from "date-fns"
import type { ReactNode } from "react"

import { itemQueryOptions } from "@/features/products/api"
import { vnZone } from "@/lib/time"
import { formatNcrJobMarker } from "@/lib/types/ncr.type"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"
import { cn } from "@/lib/utils"

type ProductionJobHeaderFactsProps = {
  job: ProductionJobDetail
}

function formatDate(value: string | null) {
  return value === null
    ? "—"
    : format(parseISO(value, { in: vnZone }), "dd/MM/yyyy")
}

// Two aligned rows of four columns: the long fields (product, customer) take two columns each.
export function ProductionJobHeaderFacts({
  job,
}: ProductionJobHeaderFactsProps) {
  const { data: item } = useQuery(itemQueryOptions(job.itemId))
  const unit = job.unit?.name ?? item?.unit.name

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4">
      <InfoField
        className="col-span-2"
        label="Sản phẩm"
        value={
          <Link
            to="/manage/products/$productId"
            params={{ productId: job.itemId }}
            search={{ tab: "info" }}
            className="text-primary hover:underline"
          >
            {job.item.code} · Rev {job.item.revision} — {job.item.name}
          </Link>
        }
      />
      <InfoField
        label="SL sản xuất"
        value={unit ? `${job.quantity} ${unit}` : job.quantity}
      />
      <InfoField
        label="PO khách hàng"
        mono
        value={
          <span className="flex flex-col">
            {job.order.buyerPoNo ? (
              <Link
                to="/manage/orders/$orderId"
                params={{ orderId: job.order.id }}
                className="text-primary hover:underline"
              >
                {job.order.buyerPoNo}
              </Link>
            ) : (
              "—"
            )}
            {job.ncrAction && (
              <span className="font-sans text-xs font-medium text-destructive">
                {formatNcrJobMarker(job.ncrAction)}
              </span>
            )}
          </span>
        }
      />
      <InfoField
        className="col-span-2"
        label="Khách hàng"
        value={job.client?.name ?? "—"}
      />
      <InfoField label="Ngày tạo" value={formatDate(job.createdAt)} />
      <InfoField label="Ngày giao hàng" value={formatDate(job.order.dueDate)} />
    </dl>
  )
}

type InfoFieldProps = {
  label: string
  value: ReactNode
  mono?: boolean
  className?: string
}

function InfoField({ label, value, mono, className }: InfoFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5", className)}>
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "truncate text-sm font-medium text-foreground",
          mono && "font-mono"
        )}
      >
        {value}
      </dd>
    </div>
  )
}
