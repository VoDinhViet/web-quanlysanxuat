import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Download, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { ClientsTable } from "@/features/clients/components/ClientsTable"
import { ClientsTableFilter } from "@/features/clients/components/ClientsTableFilter"
import {
  clientGroupOptionsQueryOptions,
  clientsQueryOptions,
} from "@/features/clients/clients.query"
import type { ClientsSearchSchema } from "@/features/clients/schemas/clients-search.schema"

export function ClientsPage() {
  // useSearch keys off the file-based route id; useNavigate's `from` keys off the
  // resolved URL path instead — the two intentionally differ. The loader
  // prefetched these queries, so useSuspenseQuery resolves synchronously.
  const search = useSearch({ from: "/(authed)/manage_/clients" })
  const navigate = useNavigate({ from: "/manage/clients" })

  const { data: clients } = useSuspenseQuery(clientsQueryOptions(search))
  const { data: clientGroupOptions } = useSuspenseQuery(
    clientGroupOptionsQueryOptions()
  )

  const handleFilterChange = (patch: Partial<ClientsSearchSchema>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch, page: 1 }) })
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Danh sách khách hàng"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Khách hàng" },
          { label: "Danh sách khách hàng" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <section className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="grid min-h-[calc(100svh-13rem)] grid-cols-1">
            <div className="flex min-w-0 flex-col border-border">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 lg:px-5">
                <h2 className="text-base font-bold tracking-wide text-primary uppercase">
                  Quản lý khách hàng
                </h2>

                {/* Export/create are visual placeholders — no export endpoint
                    and no create page exist yet (wired in a later CRUD pass). */}
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" className="text-xs">
                    <Download className="size-4" />
                    Export
                  </Button>
                  <PermissionGate permission="clients:create">
                    <Button asChild className="text-xs">
                      <Link to="/manage/clients/create">
                        <Plus className="size-4" />
                        Tạo khách hàng
                      </Link>
                    </Button>
                  </PermissionGate>
                </div>
              </div>

              <ClientsTableFilter
                search={search}
                onFilterChange={handleFilterChange}
                clientGroupOptions={clientGroupOptions}
              />

              <ClientsTable
                rows={clients.data}
                pagination={clients.pagination}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
