import { useSuspenseQuery } from "@tanstack/react-query"

import { PageBody } from "@/components/shared/layouts/PageBody"
import { PageShell } from "@/components/shared/layouts/PageShell"
import { CreateInventoryRequisitionForm } from "@/features/inventory-requisitions/components/sections/CreateInventoryRequisitionForm"
import { warehouseOptionsQueryOptions } from "@/features/warehouses/api"

export function InventoryRequisitionCreatePage() {
  // Loader-prefetched — resolves synchronously, cùng convention "Loaders prefetch" của repo.
  // Kho RM ("Kho nguyên vật liệu") — chỉ có đúng 1 kho loại này, form tự gắn warehouseId từ đây,
  // không có picker nào cho người dùng chọn. Nguồn lãnh (LSX/thủ công) chọn bằng radio ở bước ①
  // của form, không còn tách route — Job vẫn là combobox async, không có gì cần prefetch cho nó.
  const { data: rmWarehouses } = useSuspenseQuery(
    warehouseOptionsQueryOptions({ type: "RM" })
  )

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
        <CreateInventoryRequisitionForm
          warehouseId={rmWarehouses[0]?.id ?? ""}
        />
      </PageBody>
    </PageShell>
  )
}
