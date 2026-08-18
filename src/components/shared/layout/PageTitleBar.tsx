import { Link, useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Menu,
  Settings,
  User,
  UserRound,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeToggle } from "@/components/shared/layout/ThemeToggle"
import { currentUserQueryOptions } from "@/features/auth/api/options"
import { logout } from "@/features/auth/api/server-functions/logout.api"
import { resolveAvatarUrl } from "@/lib/file-url"
import type { FileRouteTypes } from "@/routeTree.gen"

type PageTitleBreadcrumb = {
  label: string
  // Typed against the generated route tree — see AppSidebar.tsx's MenuItem.href for why. A
  // href-less, non-last crumb renders as plain text (a group label, not a link) below.
  href?: FileRouteTypes["to"]
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
        {breadcrumbs.flatMap((breadcrumb, index) => {
          const isLast = index === lastIndex

          let content
          if (isLast) {
            content = <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
          } else if (breadcrumb.href) {
            content = (
              <BreadcrumbLink asChild>
                <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
              </BreadcrumbLink>
            )
          } else {
            content = breadcrumb.label
          }

          const item = (
            <BreadcrumbItem key={`item-${breadcrumb.label}-${index}`}>
              {content}
            </BreadcrumbItem>
          )

          if (isLast) {
            return [item]
          }

          return [
            item,
            <BreadcrumbSeparator
              key={`separator-${breadcrumb.label}-${index}`}
            />,
          ]
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

type UserMenuProps = {
  isLoggingOut: boolean
  onLogout: () => void
}

export function UserMenu({ isLoggingOut, onLogout }: UserMenuProps) {
  // Reads the profile the `(authed)` beforeLoad already cached — no extra fetch.
  const profileQuery = useQuery(currentUserQueryOptions)

  if (profileQuery.isPending) {
    return (
      <div className="flex items-center gap-3 px-1.5 py-1">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <span className="hidden min-w-0 flex-col gap-1.5 lg:flex">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-16" />
        </span>
      </div>
    )
  }

  const profile = profileQuery.data

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
            <AvatarImage
              src={resolveAvatarUrl(profile?.avatar)}
              alt={profile?.fullName ?? "--"}
            />
            <AvatarFallback className="bg-muted">
              <UserRound className="size-5 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>

          <span className="hidden min-w-0 text-left lg:block">
            <span className="block truncate text-sm leading-tight font-bold">
              {profile?.fullName ?? "--"}
            </span>
            {profile?.role?.name && (
              <span className="block truncate text-xs leading-tight text-muted-foreground">
                {profile.role.name}
              </span>
            )}
          </span>

          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-start gap-3 px-2 py-1.5">
          <Avatar className="size-10">
            <AvatarImage
              src={resolveAvatarUrl(profile?.avatar)}
              alt={profile?.fullName ?? "--"}
            />
            <AvatarFallback className="bg-muted">
              <UserRound className="size-5 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-1">
            <p className="truncate text-sm leading-tight font-semibold">
              {profile?.fullName ?? "--"}
            </p>
            {profile?.username && (
              <p className="truncate text-xs leading-tight text-muted-foreground">
                @{profile.username}
              </p>
            )}
            {profile?.email && (
              <p className="truncate text-xs leading-tight text-muted-foreground">
                {profile.email}
              </p>
            )}
            {profile?.role?.name && (
              <Badge variant="secondary" className="mt-1 max-w-full">
                <span className="truncate">{profile.role.name}</span>
              </Badge>
            )}
          </div>
        </div>
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
  const queryClient = useQueryClient()
  const logoutFn = useServerFn(logout)

  const logoutMutation = useMutation({
    mutationFn: () => logoutFn(),
    // Always navigate away regardless of outcome — a failed backend revoke
    // shouldn't strand the user on an authenticated page.
    onSettled: async () => {
      await router.invalidate()
      await router.navigate({ to: "/login" })
      // Clear only after leaving the authed tree — clearing while its components (this
      // one included) are still mounted would make every live observer refetch against a
      // dead session. Needed so a later login as a different user doesn't inherit this
      // one's cached permissions/data (staleTime 60s).
      queryClient.clear()
    },
  })

  const isLoggingOut = logoutMutation.isPending
  const handleLogout = () => logoutMutation.mutate()

  return (
    <header className="flex min-h-22 w-full items-center justify-between gap-4 bg-card px-4 py-4 text-card-foreground shadow-card sm:px-6">
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
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-bold text-destructive-foreground ring-2 ring-card">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
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

        <ThemeToggle />

        <UserMenu isLoggingOut={isLoggingOut} onLogout={handleLogout} />
      </div>
    </header>
  )
}
