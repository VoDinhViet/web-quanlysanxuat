import { Link } from "@tanstack/react-router"
import { AltArrowLeft } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  OqcResultBadge,
  OqcStatusBadge,
} from "@/features/oqc/components/primitives/OqcBadges"
import { OqcDetailActions } from "@/features/oqc/components/layouts/OqcDetailActions"
import type { OqcDetailFormApi } from "@/features/oqc/components/sections/OqcDetailForm"
import type { OqcDetail } from "@/lib/types/oqc.type"

type OqcDetailHeaderProps = {
  form: OqcDetailFormApi
  oqc: OqcDetail
  isPending: boolean
}

// Identity strip only — back link + mã + 2 badge + hành động. Mọi thông tin tham chiếu/lô hàng
// (trước đây nhồi 9 MetaField vào đây) đã chuyển sang OqcLotSummaryCard.tsx ở §1 thân trang, nơi
// có đủ chỗ ngang để hiển thị rõ thay vì `truncate`.
export function OqcDetailHeader({
  form,
  oqc,
  isPending,
}: OqcDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Quay lại danh sách OQC"
          asChild
        >
          <Link to="/manage/oqc" search={{ page: 1, limit: 10 }}>
            <AltArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </Link>
        </Button>

        <span className="font-mono text-lg font-bold text-foreground">
          {oqc.code}
        </span>
        <OqcStatusBadge status={oqc.status} />
        <OqcResultBadge result={oqc.result} />
      </div>

      <OqcDetailActions form={form} oqc={oqc} isPending={isPending} />
    </div>
  )
}
