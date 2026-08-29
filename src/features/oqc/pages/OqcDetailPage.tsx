import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { oqcQueryOptions } from "@/features/oqc/api/options"
import { OqcDetailForm } from "@/features/oqc/components/detail/OqcDetailForm"

export function OqcDetailPage() {
  const { oqcId } = useParams({ from: "/(authed)/manage_/oqc_/$oqcId" })

  const { data: oqc } = useSuspenseQuery(oqcQueryOptions(oqcId))

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết OQC"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Kiểm tra chất lượng (QC)" },
          { label: "OQC", href: "/manage/oqc" },
          { label: oqc.code },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <OqcDetailForm oqc={oqc} />
      </div>
    </main>
  )
}
