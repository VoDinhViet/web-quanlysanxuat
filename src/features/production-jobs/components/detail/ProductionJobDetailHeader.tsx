import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { AltArrowLeft, Diskette } from "@solar-icons/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { ProductionJobStatusBadge } from "@/features/production-jobs/components/ProductionJobBadges"
import { ProductionJobDetailTabs } from "@/features/production-jobs/components/detail/ProductionJobDetailTabs"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type ProductionJobDetailHeaderProps = {
  detail: ProductionJobDetail
}

// Identity, the header facts and the tab strip read as one unit, so they share a single block
// like ProductDetailHeader.tsx. The "Lưu" button stays disabled — no update mutation wired up
// yet.
export function ProductionJobDetailHeader({
  detail,
}: ProductionJobDetailHeaderProps) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 print:hidden">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
              aria-label="Quay lại danh sách Job"
              asChild
            >
              <Link
                to="/manage/production-jobs"
                search={{ page: 1, limit: 10 }}
              >
                <AltArrowLeft className="size-4" />
                <span className="hidden sm:inline">Quay lại</span>
              </Link>
            </Button>

            <span className="font-mono text-lg font-bold text-foreground">
              {detail.code}
            </span>
            <ProductionJobStatusBadge status={detail.status} />
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-3">
            <InfoField
              label="Sản phẩm"
              value={
                <Link
                  to="/manage/products/$productId"
                  params={{ productId: detail.productId }}
                  search={{ tab: "info" }}
                  className="text-primary hover:underline"
                >
                  {detail.product.code} — {detail.product.name}
                </Link>
              }
            />
            <InfoField label="SL sản xuất" value={`${detail.quantity} Bộ`} />
            <InfoField
              label="PO / HĐ"
              value={
                <Link
                  to="/manage/orders/$orderId"
                  params={{ orderId: detail.order.id }}
                  className="text-primary hover:underline"
                >
                  {detail.order.code}
                </Link>
              }
              mono
            />
            <InfoField label="Khách hàng" value={detail.client?.name ?? "—"} />
            <InfoField
              label="Ngày tạo"
              value={DateTime.fromISO(detail.createdAt).toFormat("dd/MM/yyyy")}
            />
            <InfoField
              label="Ngày giao hàng"
              value={
                detail.order.dueDate === null
                  ? "—"
                  : DateTime.fromISO(detail.order.dueDate).toFormat(
                      "dd/MM/yyyy"
                    )
              }
            />
          </dl>
        </div>

        <Button
          type="button"
          disabled
          className="gap-1.5"
          aria-label="Lưu — chưa được kết nối API"
        >
          <Diskette className="size-4" />
          Lưu
        </Button>
      </div>

      <ProductionJobDetailTabs />
    </>
  )
}

type InfoFieldProps = {
  label: string
  value: ReactNode
  mono?: boolean
}

function InfoField({ label, value, mono }: InfoFieldProps) {
  return (
    <div className="flex items-baseline gap-1.5 text-xs">
      <dt className="shrink-0 text-muted-foreground">{label}:</dt>
      <dd
        className={
          mono
            ? "truncate font-mono font-semibold text-foreground"
            : "truncate font-semibold text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  )
}
