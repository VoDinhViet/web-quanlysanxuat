import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { Icon } from "@iconify/react"
import altArrowLeftBold from "@iconify-icons/solar/alt-arrow-left-bold"
import disketteBold from "@iconify-icons/solar/diskette-bold"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { MissingFieldValue } from "@/components/shared/MissingFieldValue"
import { ProductionJobStatusBadge } from "@/features/production-jobs/components/ProductionJobBadges"
import { ProductionJobDetailTabs } from "@/features/production-jobs/components/detail/ProductionJobDetailTabs"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type ProductionJobDetailHeaderProps = {
  detail: ProductionJobDetail
}

// Identity, the header facts and the tab strip read as one unit, so they share a single block
// like ProductDetailHeader.tsx. The "Lưu" button stays disabled — no update mutation wired up
// yet. `productName`/`poNumber`/`clientName`/`dueDate` have no source on GET
// /production-jobs/:jobId (a deliberately unjoined DTO — see production-job.type.ts) and render
// as MissingFieldValue instead of a real value.
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
                <Icon icon={altArrowLeftBold} className="size-4" />
                <span className="hidden sm:inline">Quay lại</span>
              </Link>
            </Button>

            <span className="font-mono text-lg font-bold text-foreground">
              {detail.code}
            </span>
            <ProductionJobStatusBadge status={detail.status} />
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-3">
            <InfoField label="Sản phẩm" value={<MissingFieldValue />} />
            <InfoField label="SL sản xuất" value={`${detail.quantity} Bộ`} />
            <InfoField label="PO / HĐ" value={<MissingFieldValue />} />
            <InfoField label="Khách hàng" value={<MissingFieldValue />} />
            <InfoField
              label="Ngày tạo"
              value={DateTime.fromISO(detail.createdAt).toFormat("dd/MM/yyyy")}
            />
            <InfoField label="Ngày giao hàng" value={<MissingFieldValue />} />
          </dl>
        </div>

        <Button
          type="button"
          disabled
          className="gap-1.5"
          aria-label="Lưu — chưa được kết nối API"
        >
          <Icon icon={disketteBold} className="size-4" />
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
