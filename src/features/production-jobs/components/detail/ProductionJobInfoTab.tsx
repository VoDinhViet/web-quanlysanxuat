import { DateTime } from "luxon"
import { Info, Logs, Paperclip, StickyNote } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { ProductionJobStatusBadge } from "@/features/production-jobs/components/ProductionJobBadges"
import { ProductionJobDocumentsSection } from "@/features/production-jobs/components/detail/ProductionJobDocumentsSection"
import { ProductionJobLogSection } from "@/features/production-jobs/components/detail/ProductionJobLogSection"
import { ProductionJobNotesSection } from "@/features/production-jobs/components/detail/ProductionJobNotesSection"
import type { ProductionJobMockDetail } from "@/lib/types/production-job.type"

type ProductionJobInfoTabProps = {
  detail: ProductionJobMockDetail
}

// "Thông tin chung" tab — cột chính (tóm tắt + Lịch sử) và cột phụ (Tài liệu/Ghi chú) chia 2
// phần, cùng bố cục `grid-cols-[minmax(0,1fr)_340px]` + `border-l` mà ProductDetailPage.tsx dùng
// cho ProductDetailSidebar — không bịa layout mới. Trong mỗi cột, các khối tách nhau bằng đường
// kẻ (`InfoSection`'s `not-first:border-t`) chứ không phải card lồng card. `InfoSection` chỉ lo
// tiêu đề + đường kẻ; padding nội dung do từng khối tự quyết (xem từng call site bên dưới).
export function ProductionJobInfoTab({ detail }: ProductionJobInfoTabProps) {
  const remainingQty = detail.quantity - detail.producedQty

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <InfoSection title="Thông tin chung" icon={Info}>
          <dl className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="divide-y divide-border">
              <SummaryRow label="Mã Job" value={detail.code} mono />
              <SummaryRow label="LSX" value={detail.lsxCode} mono />
              <SummaryRow label="Khách hàng" value={detail.clientName} />
              <SummaryRow label="Sản phẩm" value={detail.productName} />
              <SummaryRow label="PO / HĐ" value={detail.poNumber} mono />
            </div>
            <div className="divide-y divide-border">
              <SummaryRow label="SL sản xuất" value={`${detail.quantity} Bộ`} />
              <SummaryRow label="Đã nhập" value={`${detail.producedQty} Bộ`} />
              <SummaryRow label="Còn lại" value={`${remainingQty} Bộ`} />
              <SummaryRow
                label="Ngày tạo"
                value={DateTime.fromISO(detail.createdAt).toFormat(
                  "dd/MM/yyyy"
                )}
              />
              <SummaryRow
                label="Ngày giao hàng"
                value={DateTime.fromISO(detail.dueDate).toFormat("dd/MM/yyyy")}
              />
              <SummaryRow
                label="Trạng thái"
                value={<ProductionJobStatusBadge status={detail.status} />}
              />
            </div>
          </dl>
        </InfoSection>

        <InfoSection title="Lịch sử thay đổi" icon={Logs}>
          <ProductionJobLogSection logs={detail.logs} />
        </InfoSection>
      </div>

      <aside className="min-w-0 border-t border-border xl:border-t-0 xl:border-l">
        <InfoSection title="Tài liệu đính kèm" icon={Paperclip}>
          <div className="p-4 sm:p-5">
            <ProductionJobDocumentsSection documents={detail.documents} />
          </div>
        </InfoSection>

        <InfoSection title="Ghi chú" icon={StickyNote}>
          <div className="p-4 sm:p-5">
            <ProductionJobNotesSection notes={detail.notes} />
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
