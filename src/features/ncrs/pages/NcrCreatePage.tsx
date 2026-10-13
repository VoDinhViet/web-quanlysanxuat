import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { NcrCreateForm } from "@/features/ncrs/components/sections/NcrCreateForm"

export function NcrCreatePage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo NCR"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Kiểm tra chất lượng (QC)" },
          { label: "NCR", href: "/manage/ncrs" },
          { label: "Tạo NCR" },
        ]}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <NcrCreateForm />
      </div>
    </main>
  )
}
