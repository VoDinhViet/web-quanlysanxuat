import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { LinkButton } from "@/components/ui/button"
import { Surface } from "@/components/shared/layouts/Surface"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { RolesTable } from "@/features/roles/components/sections/RolesTable"
import { rolesQueryOptions } from "@/features/roles/api/options"

export function RolesPage() {
  const rolesQuery = useQuery(rolesQueryOptions())

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <div className="flex items-center justify-end px-4 py-4 sm:px-5">
          <RoutePermissionGate route="/manage/roles/create">
            <LinkButton to="/manage/roles/create" size="sm" className="text-xs">
              <Plus className="size-4" />
              Tạo vai trò
            </LinkButton>
          </RoutePermissionGate>
        </div>

        {rolesQuery.isPending ? (
          <TableQueryLoading rows={5} />
        ) : rolesQuery.isError ? (
          <TableQueryError
            error={rolesQuery.error.message}
            onRetry={() => void rolesQuery.refetch()}
          />
        ) : (
          <RolesTable
            rows={rolesQuery.data}
            isPending={rolesQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}
