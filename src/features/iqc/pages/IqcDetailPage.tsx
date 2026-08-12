import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { iqcQueryOptions } from "@/features/iqc/api/options"
import { IqcAqlInputCard } from "@/features/iqc/components/detail/IqcAqlInputCard"
import { IqcDetailHeader } from "@/features/iqc/components/detail/IqcDetailHeader"
import { IqcDetailReferenceCard } from "@/features/iqc/components/detail/IqcDetailReferenceCard"
import { IqcDispositionCard } from "@/features/iqc/components/detail/IqcDispositionCard"
import { IqcStatusLegend } from "@/features/iqc/components/detail/IqcStatusLegend"

export function IqcDetailPage() {
  const { iqcId } = useParams({ from: "/(authed)/manage_/iqc_/$iqcId" })

  const { data: detail } = useSuspenseQuery(iqcQueryOptions(iqcId))

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết IQC"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Kiểm tra chất lượng (QC)" },
          { label: "IQC", href: "/manage/iqc" },
          { label: detail.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface>
          <IqcDetailHeader detail={detail} />
        </Surface>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <IqcAqlInputCard detail={detail} />
            <IqcDispositionCard detail={detail} />
          </div>

          <div className="flex flex-col gap-4">
            <IqcDetailReferenceCard detail={detail} />
            <IqcStatusLegend current={detail.status} />
          </div>
        </div>
      </div>
    </main>
  )
}
