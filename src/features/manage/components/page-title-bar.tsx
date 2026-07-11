import { Fragment } from "react"
import { Bell, ChevronDown, CircleHelp, Menu } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

type PageTitleBreadcrumb = {
  label: string
  href?: string
}

type PageTitleBarProps = {
  title: string
  breadcrumbs: PageTitleBreadcrumb[]
  notificationCount?: number
  userName?: string
  userRole?: string
  userAvatarSrc?: string
}

export function PageTitleBar({
  title,
  breadcrumbs,
  notificationCount = 0,
  userName = "Admin ERP",
  userRole = "Quản trị hệ thống",
  userAvatarSrc,
}: PageTitleBarProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="flex min-h-22 w-full items-center justify-between gap-4 bg-card px-4 py-4 text-card-foreground shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="text-primary hover:bg-accent hover:text-accent-foreground"
          onClick={toggleSidebar}
          aria-label="Mở hoặc thu gọn thanh điều hướng"
        >
          <Menu className="size-5" />
        </Button>

        <div className="min-w-0 space-y-2">
          <h1 className="truncate text-xl leading-6 font-bold text-primary sm:text-2xl">
            {title}
          </h1>

          <Breadcrumb>
            <BreadcrumbList className="gap-1.5 text-xs font-semibold text-primary/72 sm:text-sm">
              {breadcrumbs.map((breadcrumb, index) => {
                const isLast = index === breadcrumbs.length - 1

                return (
                  <Fragment key={`${breadcrumb.label}-${index}`}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="text-primary">
                          {breadcrumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href={breadcrumb.href ?? "#"}
                          className="text-primary/72 hover:text-primary"
                        >
                          {breadcrumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>

                    {!isLast ? (
                      <BreadcrumbSeparator className="text-primary/45" />
                    ) : null}
                  </Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative size-9 text-primary hover:bg-accent hover:text-accent-foreground"
          aria-label="Thông báo"
        >
          <Bell className="size-5" />
          {notificationCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-bold text-white ring-2 ring-card">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          ) : null}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden size-9 text-primary hover:bg-accent hover:text-accent-foreground sm:inline-flex"
          aria-label="Trợ giúp"
        >
          <CircleHelp className="size-5" />
        </Button>

        <button
          type="button"
          className="flex items-center gap-3 rounded-md px-1.5 py-1 transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label="Tài khoản người dùng"
        >
          <Avatar size="lg" className="size-10">
            <AvatarImage src={userAvatarSrc} alt={userName} />
            <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
              AE
            </AvatarFallback>
          </Avatar>

          <span className="hidden min-w-0 text-left lg:block">
            <span className="block truncate text-sm font-bold text-primary">
              {userName}
            </span>
            <span className="block truncate text-[10px] font-semibold text-primary/70">
              {userRole}
            </span>
          </span>

          <ChevronDown className="hidden size-4 text-primary lg:block" />
        </button>
      </div>
    </header>
  )
}
