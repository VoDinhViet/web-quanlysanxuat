import { Fragment } from "react"
import { Icon } from "@iconify/react"
import userBold from "@iconify-icons/solar/user-bold"
import { Link, useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Menu,
  Settings,
  User,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { currentUserQueryOptions } from "@/features/auth/current-user.query"
import { logout } from "@/features/auth/server-functions/logout"
import { isKnownRoute } from "@/lib/known-routes"

const FALLBACK_USER_NAME = "--"

type PageTitleBreadcrumb = {
  label: string
  href?: string
}

type PageTitleBarProps = {
  title: string
  breadcrumbs: PageTitleBreadcrumb[]
  notificationCount?: number
}

type PageBreadcrumbsProps = {
  breadcrumbs: PageTitleBreadcrumb[]
}

function PageBreadcrumbs({ breadcrumbs }: PageBreadcrumbsProps) {
  const lastIndex = breadcrumbs.length - 1

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <Fragment key={`${breadcrumb.label}-${index}`}>
            <BreadcrumbItem>
              {index === lastIndex ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  {breadcrumb.href && isKnownRoute(breadcrumb.href) ? (
                    <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                  ) : (
                    <a href={breadcrumb.href ?? "#"}>{breadcrumb.label}</a>
                  )}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>

            {index < lastIndex ? <BreadcrumbSeparator /> : null}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

type UserMenuProps = {
  fullName: string
  isLoggingOut: boolean
  onLogout: () => void
}

function UserMenu({ fullName, isLoggingOut, onLogout }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto gap-3 px-1.5 py-1"
          aria-label="Tài khoản người dùng"
        >
          <Avatar className="size-10">
            <AvatarFallback>
              <Icon icon={userBold} className="size-3/5" />
            </AvatarFallback>
          </Avatar>

          <span className="hidden min-w-0 text-left lg:block">
            <span className="block truncate text-sm font-bold">{fullName}</span>
          </span>

          <ChevronDown className="hidden lg:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
        <DropdownMenuItem className="py-3">
          <Avatar className="size-8">
            <AvatarFallback>
              <Icon icon={userBold} className="size-3/5" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{fullName}</p>
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
        <DropdownMenuItem
          variant="destructive"
          disabled={isLoggingOut}
          onSelect={onLogout}
        >
          <LogOut />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function PageTitleBar({
  title,
  breadcrumbs,
  notificationCount = 0,
}: PageTitleBarProps) {
  const { toggleSidebar } = useSidebar()
  const router = useRouter()
  const logoutFn = useServerFn(logout)

  // Reads the profile the `(authed)` beforeLoad already cached — no extra fetch.
  const profileQuery = useQuery(currentUserQueryOptions)
  const fullName = profileQuery.data?.fullName ?? FALLBACK_USER_NAME

  const logoutMutation = useMutation({
    mutationFn: () => logoutFn(),
    // Always navigate away regardless of outcome — a failed backend revoke
    // shouldn't strand the user on an authenticated page.
    onSettled: async () => {
      await router.invalidate()
      await router.navigate({ to: "/login" })
    },
  })

  const isLoggingOut = logoutMutation.isPending
  const handleLogout = () => logoutMutation.mutate()

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
          <h1 className="truncate text-xl leading-6 font-bold capitalize sm:text-2xl">
            {title}
          </h1>

          <PageBreadcrumbs breadcrumbs={breadcrumbs} />
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
            <span className="absolute -top-0.5 -right-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-bold text-white ring-2 ring-card">
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

        <UserMenu
          fullName={fullName}
          isLoggingOut={isLoggingOut}
          onLogout={handleLogout}
        />
      </div>
    </header>
  )
}
