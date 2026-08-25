import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { CreateOperationForm } from "@/features/operations/components/CreateOperationForm"

export function CreateOperationPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Tạo công đoạn"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Danh mục" },
          { label: "Công đoạn", href: "/manage/operations" },
          { label: "Tạo công đoạn" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <CreateOperationForm />
      </div>
    </main>
  )
}
