import { PageBody } from "@/components/shared/layouts/PageBody"
import { PageShell } from "@/components/shared/layouts/PageShell"
import { CreateInventoryRequisitionForm } from "@/features/inventory-requisitions/components/sections/CreateInventoryRequisitionForm"

// Không có gì cần prefetch — nguồn lãnh (LSX/thủ công) chọn bằng radio ở bước ① của form, Job là
// combobox async.
export function InventoryRequisitionCreatePage() {
  return (
    <PageShell
      title="Tạo phiếu lãnh vật tư"
      breadcrumbs={[
        { label: "Quản lý sản xuất" },
        { label: "Lãnh vật tư", href: "/manage/inventory-requisitions" },
        { label: "Tạo phiếu" },
      ]}
    >
      <PageBody>
        <CreateInventoryRequisitionForm />
      </PageBody>
    </PageShell>
  )
}
