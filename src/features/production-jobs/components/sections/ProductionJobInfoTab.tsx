import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { DateTime } from "luxon"
import { Info, Logs, StickyNote } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { productionOrderQueryOptions } from "@/features/production-orders/api"
import { ProductionJobStatusBadge } from "@/features/production-jobs/components/primitives/ProductionJobBadges"
import { ProductionJobLogSection } from "@/features/production-jobs/components/composites/ProductionJobLogSection"
import { ProductionJobNotesSection } from "@/features/production-jobs/components/sections/ProductionJobNotesSection"
import type { ProductionJobDetail } from "@/lib/types/production-job.type"

type ProductionJobInfoTabProps = {
  productionJob: ProductionJobDetail
}

// "Thông tin chung" tab — cột chính (tóm tắt + Lịch sử) và cột phụ (Ghi chú) chia 2
// phần, cùng bố cục `grid-cols-[minmax(0,1fr)_340px]` + `border-l` mà ProductDetailPage.tsx dùng
// cho ProductDetailSidebar — không bịa layout mới. Trong mỗi cột, các khối tách nhau bằng đường
// kẻ (`InfoSection`'s `not-first:border-t`) chứ không phải card lồng card. `InfoSection` chỉ lo
// tiêu đề + đường kẻ; padding nội dung do từng khối tự quyết (xem từng call site bên dưới).
// Không có dòng "Đã nhập"/"Còn lại" — `producedQty`/`rejectedQty` đã bị xoá khỏi
// `production_jobs` phía backend (chưa có route báo sản lượng), không phải chỉ chưa expose.
export function ProductionJobInfoTab({
  productionJob,
}: ProductionJobInfoTabProps) {
  // Mã LSX không có trên GET /production-jobs/:jobId (chỉ có productionOrderId dạng UUID) — đọc
  // riêng qua production-orders, client-side, không chặn paint của tab (giống cách BOM/Operations
  // tab tự đọc dữ liệu riêng).
  const productionOrderQuery = useQuery(
    productionOrderQueryOptions(productionJob.productionOrderId)
  )

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <InfoSection title="Thông tin chung" icon={Info}>
          <dl className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="divide-y divide-border">
              <SummaryRow label="Mã Job" value={productionJob.code} mono />
              <SummaryRow
                label="LSX"
                value={
                  <Link
                    to="/manage/production-orders/$productionOrderId"
                    params={{
                      productionOrderId: productionJob.productionOrderId,
                    }}
                    className="text-primary hover:underline"
                  >
                    {productionOrderQuery.isPending
                      ? "…"
                      : (productionOrderQuery.data?.code ?? "—")}
                  </Link>
                }
                mono
              />
              <SummaryRow
                label="Khách hàng"
                value={productionJob.client?.name ?? "—"}
              />
              <SummaryRow
                label="Sản phẩm"
                value={
                  <Link
                    to="/manage/products/$productId"
                    params={{ productId: productionJob.itemId }}
                    search={{ tab: "info" }}
                    className="text-primary hover:underline"
                  >
                    {productionJob.item.code} — {productionJob.item.name}
                  </Link>
                }
              />
              <SummaryRow
                label="PO / HĐ"
                value={
                  <Link
                    to="/manage/orders/$orderId"
                    params={{ orderId: productionJob.order.id }}
                    className="text-primary hover:underline"
                  >
                    {productionJob.order.code}
                  </Link>
                }
                mono
              />
            </div>
            <div className="divide-y divide-border">
              <SummaryRow
                label="SL sản xuất"
                value={`${productionJob.quantity} Bộ`}
              />
              <SummaryRow
                label="Ngày tạo"
                value={DateTime.fromISO(productionJob.createdAt).toFormat(
                  "dd/MM/yyyy"
                )}
              />
              <SummaryRow
                label="Ngày giao hàng"
                value={
                  productionJob.order.dueDate === null
                    ? "—"
                    : DateTime.fromISO(productionJob.order.dueDate).toFormat(
                        "dd/MM/yyyy"
                      )
                }
              />
              <SummaryRow
                label="Trạng thái"
                value={
                  <ProductionJobStatusBadge status={productionJob.status} />
                }
              />
            </div>
          </dl>
        </InfoSection>

        <InfoSection title="Lịch sử thay đổi" icon={Logs}>
          <div className="p-4 sm:p-5">
            <ProductionJobLogSection />
          </div>
        </InfoSection>
      </div>

      <aside className="min-w-0 border-t border-border xl:border-t-0 xl:border-l">
        <InfoSection title="Ghi chú" icon={StickyNote}>
          <div className="p-4 sm:p-5">
            <ProductionJobNotesSection productionJobId={productionJob.id} />
          </div>
        </InfoSection>
      </aside>
    </div>
  )
}

type InfoSectionProps = {
  title: string
  icon: LucideIcon
  children: ReactNode
}

function InfoSection({ title, icon: Icon, children }: InfoSectionProps) {
  return (
    <div className="not-first:border-t not-first:border-border">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase sm:px-5">
        <Icon className="size-3.5 text-muted-foreground" />
        {title}
      </h3>
      {children}
    </div>
  )
}

type SummaryRowProps = {
  label: string
  value: ReactNode
  mono?: boolean
}

function SummaryRow({ label, value, mono }: SummaryRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] items-center gap-3 px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={
          mono
            ? "font-mono text-sm font-semibold break-words text-foreground"
            : "text-sm font-semibold break-words text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  )
}
