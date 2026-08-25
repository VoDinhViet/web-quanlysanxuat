import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { UpdateOperationForm } from "@/features/operations/components/UpdateOperationForm"
import { operationQueryOptions } from "@/features/operations/api/options"

export function UpdateOperationPage() {
  const { operationId } = useParams({
    from: "/(authed)/manage_/operations_/$operationId/update",
  })

  const { data: operation } = useSuspenseQuery(
    operationQueryOptions(operationId)
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chỉnh sửa công đoạn"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Danh mục" },
          { label: "Công đoạn", href: "/manage/operations" },
          { label: "Chỉnh sửa công đoạn" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <UpdateOperationForm operation={operation} />
      </div>
    </main>
  )
}
