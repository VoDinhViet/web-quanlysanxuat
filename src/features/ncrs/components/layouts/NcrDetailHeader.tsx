import { AltArrowLeft } from "@solar-icons/react"

import { LinkButton } from "@/components/ui/button"
import { NcrDetailActions } from "@/features/ncrs/components/layouts/NcrDetailActions"
import {
  NcrStatusBadge,
  NcrTypeBadge,
} from "@/features/ncrs/components/primitives/NcrBadges"
import type { NcrDetail } from "@/lib/types/ncr.type"

type NcrDetailHeaderProps = {
  ncr: NcrDetail
}

export function NcrDetailHeader({ ncr }: NcrDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center gap-3">
        <LinkButton
          to="/manage/ncrs"
          search={{ page: 1, limit: 10 }}
          variant="ghost"
          className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Quay lại danh sách NCR"
        >
          <AltArrowLeft className="size-4" />
          <span className="hidden sm:inline">Quay lại</span>
        </LinkButton>

        <span className="font-mono text-lg font-bold text-foreground">
          {ncr.code}
        </span>
        <NcrTypeBadge type={ncr.type} />
        <NcrStatusBadge status={ncr.status} />
      </div>

      <NcrDetailActions ncr={ncr} />
    </div>
  )
}
