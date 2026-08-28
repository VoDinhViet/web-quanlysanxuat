import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { iqcQueryOptions } from "@/features/iqc/api/options"
import { IqcDetailForm } from "@/features/iqc/components/detail/IqcDetailForm"

export function IqcDetailPage() {
  const { iqcId } = useParams({ from: "/(authed)/manage_/iqc_/$iqcId" })

  const { data: iqc } = useSuspenseQuery(iqcQueryOptions(iqcId))

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết IQC"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Kiểm tra chất lượng (QC)" },
          { label: "IQC", href: "/manage/iqc" },
          { label: iqc.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <IqcDetailForm iqc={iqc} />
      </div>
    </main>
  )
}
