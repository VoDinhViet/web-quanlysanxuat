import { Fragment } from "react"
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Menu,
  Settings,
  User,
} from "lucide-react"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
          size="icon"
          onClick={toggleSidebar}
          aria-label="Mở hoặc thu gọn thanh điều hướng"
        >
          <Menu />
        </Button>

        <div className="min-w-0 space-y-2">
          <h1 className="truncate text-xl font-bold leading-6 sm:text-2xl">
            {title}
          </h1>

          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => {
                const isLast = index === breadcrumbs.length - 1

                return (
                  <Fragment key={`${breadcrumb.label}-${index}`}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <a href={breadcrumb.href ?? "#"}>
                            {breadcrumb.label}
                          </a>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>

                    {!isLast ? <BreadcrumbSeparator /> : null}
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
          className="relative"
          aria-label="Thông báo"
        >
          <Bell />
          {notificationCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white ring-2 ring-card">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          ) : null}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden sm:inline-flex"
          aria-label="Trợ giúp"
        >
          <CircleHelp />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-auto gap-3 px-1.5 py-1"
              aria-label="Tài khoản người dùng"
            >
              <Avatar size="lg">
                <AvatarImage src={userAvatarSrc} alt={userName} />
                <AvatarFallback>AE</AvatarFallback>
              </Avatar>

              <span className="hidden min-w-0 text-left lg:block">
                <span className="block truncate text-sm font-bold">
                  {userName}
                </span>
                <span className="block truncate text-[10px] font-semibold text-muted-foreground">
                  {userRole}
                </span>
              </span>

              <ChevronDown className="hidden lg:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
            <DropdownMenuItem className="py-3">
              <Avatar>
                <AvatarImage src={userAvatarSrc} alt={userName} />
                <AvatarFallback>AE</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{userName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {userRole}
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User />
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings />
              Cài đặt tài khoản
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CircleHelp />
              Trợ giúp
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOut />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
