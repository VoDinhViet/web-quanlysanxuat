import { useNavigate, useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  AltArrowLeft,
  PenNewSquare,
  TrashBinTrash,
  UsersGroupRounded,
} from "@solar-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button, LinkButton } from "@/components/ui/button"
import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { Surface } from "@/components/shared/layouts/Surface"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { DeleteDepartmentDialog } from "@/features/departments/components/composites/DeleteDepartmentDialog"
import { UpdateDepartmentDialog } from "@/features/departments/components/composites/UpdateDepartmentDialog"
import { DepartmentOverviewSection } from "@/features/departments/components/sections/DepartmentOverviewSection"
import { DepartmentPositionsSection } from "@/features/departments/components/sections/DepartmentPositionsSection"
import { departmentDetailQueryOptions } from "@/features/departments/api/options"
import { cn } from "@/lib/utils"

export function DepartmentDetailPage() {
  const { departmentId } = useParams({
    from: "/(authed)/manage_/departments_/$departmentId",
  })
  const navigate = useNavigate({ from: "/manage/departments/$departmentId" })

  // The route loader prefetches this with staleTime: "static" — resolves synchronously here,
  // like useLoaderData used to.
  const { data: department } = useSuspenseQuery(
    departmentDetailQueryOptions(departmentId)
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title={department.name}
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Hệ thống" },
          { label: "Phòng ban", href: "/manage/departments" },
          { label: department.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-4">
            <Surface>
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <LinkButton
                    to="/manage/departments"
                    search={{ page: 1, limit: 10 }}
                    variant="ghost"
                    className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
                    aria-label="Quay lại danh sách phòng ban"
                  >
                    <AltArrowLeft className="size-4" />
                    <span className="hidden sm:inline">Phòng ban</span>
                  </LinkButton>

                  <span className="h-4 w-px shrink-0 bg-border" />

                  <h1 className="min-w-0 truncate font-heading text-base font-bold text-foreground sm:text-lg">
                    {department.name}
                  </h1>
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1.5 text-[11px] font-medium",
                      department.isActive !== false
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        department.isActive !== false
                          ? "bg-success"
                          : "bg-muted-foreground/50"
                      )}
                    />
                    {department.isActive !== false
                      ? "Đang hoạt động"
                      : "Ngừng hoạt động"}
                  </Badge>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <LinkButton
                    to="/manage/users"
                    search={{
                      page: 1,
                      limit: 10,
                      departmentId: department.id,
                    }}
                    variant="outline"
                    className="text-xs"
                  >
                    <UsersGroupRounded className="size-4" />
                    Nhân sự
                  </LinkButton>

                  <PermissionGate permission="departments:update">
                    <UpdateDepartmentDialog
                      department={department}
                      trigger={
                        <Button
                          type="button"
                          variant="outline"
                          className="text-xs"
                        >
                          <PenNewSquare className="size-4" />
                          Sửa
                        </Button>
                      }
                    />
                  </PermissionGate>

                  <PermissionGate permission="departments:delete">
                    <DeleteDepartmentDialog
                      department={department}
                      onSuccess={() =>
                        void navigate({
                          to: "/manage/departments",
                          search: { page: 1, limit: 10 },
                        })
                      }
                      trigger={
                        <Button
                          type="button"
                          variant="outline"
                          className="border-destructive/30 text-xs text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <TrashBinTrash className="size-4" />
                          Xóa
                        </Button>
                      }
                    />
                  </PermissionGate>
                </div>
              </div>
            </Surface>

            <DepartmentPositionsSection departmentId={department.id} />
          </div>

          <div className="flex flex-col gap-4">
            <DepartmentOverviewSection department={department} />
          </div>
        </div>
      </div>
    </main>
  )
}
