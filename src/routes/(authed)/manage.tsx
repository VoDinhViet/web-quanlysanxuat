import { createFileRoute } from "@tanstack/react-router"

import { ManagePage } from "@/features/manage/pages/ManagePage"
import { upcomingDeliveriesQueryOptions } from "@/features/manage/hooks/use-upcoming-deliveries"
import { manageSearchSchema } from "@/features/manage/schemas/manage-search.schema"
import {
  jobDueDateQueryOptions,
  openNcrQueryOptions,
  outsourcingOrderDueDateQueryOptions,
  productionProgressQueryOptions,
  qcPassRateQueryOptions,
  reportAlertsQueryOptions,
  reportStatsQueryOptions,
} from "@/features/reports/api"

export const Route = createFileRoute("/(authed)/manage")({
  validateSearch: manageSearchSchema,
  // No loaderDeps: đổi khoảng ngày ở "Tiến độ sản xuất" không được re-trigger loader này (nó
  // fire-and-forget prefetch 7 widget — chạy lại sẽ làm trắng cả trang). `location.search` đã
  // được router validate ở runtime nhưng LoaderFnContext gõ kiểu `{}` (do không có loaderDeps) —
  // parse lại là cách lấy đúng type mà không cần `as` — theo đúng pattern MaterialsPage.
  //
  // Fire-and-forget, không chặn route — mọi widget dashboard tự `useQuery` với skeleton/lỗi
  // riêng (như ManageStatCards đã làm), trang không đợi toàn bộ load xong mới hiện. Mỗi query ở
  // đây được các hook tương ứng (src/features/manage/hooks/) export lại nguyên bản — không tự
  // tính tham số ở loader, để không bao giờ lệch query key với hook thật sự đọc dữ liệu.
  loader: ({ context, location }) => {
    void context.queryClient.prefetchQuery(reportStatsQueryOptions())
    void context.queryClient.prefetchQuery(reportAlertsQueryOptions())
    void context.queryClient.prefetchQuery(
      productionProgressQueryOptions(manageSearchSchema.parse(location.search))
    )
    void context.queryClient.prefetchQuery(upcomingDeliveriesQueryOptions())
    void context.queryClient.prefetchQuery(
      outsourcingOrderDueDateQueryOptions()
    )
    void context.queryClient.prefetchQuery(jobDueDateQueryOptions())
    void context.queryClient.prefetchQuery(openNcrQueryOptions())
    void context.queryClient.prefetchQuery(qcPassRateQueryOptions())
  },
  component: ManagePage,
})
