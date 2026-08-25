import { createFileRoute } from "@tanstack/react-router"

import { ManagePage } from "@/features/manage/pages/ManagePage"
import { reportStatsQueryOptions } from "@/features/reports/api"

export const Route = createFileRoute("/(authed)/manage")({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(reportStatsQueryOptions())
  },
  component: ManagePage,
})
