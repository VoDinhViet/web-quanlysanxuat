import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageBody } from "@/components/shared/layouts/PageBody"
import { PageShell } from "@/components/shared/layouts/PageShell"
import { Surface } from "@/components/shared/layouts/Surface"
import { inventoryIssueQueryOptions } from "@/features/inventory-issues/api/options"
import { InventoryIssueDetailHeader } from "@/features/inventory-issues/components/layouts/InventoryIssueDetailHeader"
import { InventoryIssueDetailItemsSection } from "@/features/inventory-issues/components/sections/InventoryIssueDetailItemsSection"
import { InventoryIssueDetailInfoCard } from "@/features/inventory-issues/components/composites/InventoryIssueDetailInfoCard"

export function InventoryIssueDetailPage() {
  const { issueId } = useParams({
    from: "/(authed)/manage_/inventory-issues_/$issueId",
  })

  const { data: inventoryIssue } = useSuspenseQuery(
    inventoryIssueQueryOptions(issueId)
  )

  return (
    <PageShell
      title="Chi tiết phiếu xuất kho"
      breadcrumbs={[
        { label: "Quản lý kho" },
        { label: "Xuất kho", href: "/manage/inventory-issues" },
        { label: inventoryIssue.code },
      ]}
    >
      <PageBody>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Surface>
            <InventoryIssueDetailHeader inventoryIssue={inventoryIssue} />
            <InventoryIssueDetailItemsSection inventoryIssue={inventoryIssue} />
          </Surface>

          <div className="flex flex-col gap-4">
            <InventoryIssueDetailInfoCard inventoryIssue={inventoryIssue} />
          </div>
        </div>
      </PageBody>
    </PageShell>
  )
}
