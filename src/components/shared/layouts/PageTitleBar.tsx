import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Menu,
  Settings,
  User,
} from "lucide-react"
import { Gallery } from "@solar-icons/react"

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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/shared/layouts/ThemeToggle"
import { currentUserQueryOptions, useLogout } from "@/features/auth/api"
import { resolveFileUrl } from "@/lib/file-url"
import type { FileRouteTypes } from "@/routeTree.gen"

export type PageTitleBreadcrumb = {
  label: string
  // Typed against the generated route tree — see AppSidebar.tsx's MenuItem.href for why. A
  // href-less, non-last crumb renders as plain text (a group label, not a link) below.
  href?: FileRouteTypes["to"]
}

type PageTitleBarProps = {
  title: string
  breadcrumbs: PageTitleBreadcrumb[]
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
            {profile?.avatar && (
              <AvatarImage
                src={resolveFileUrl(profile.avatar.url)}
                alt={profile.fullName ?? "--"}
              />
            )}
            <AvatarFallback className="bg-muted">
              <Gallery className="size-5 text-muted-foreground" />
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
            {profile?.avatar && (
              <AvatarImage
                src={resolveFileUrl(profile.avatar.url)}
                alt={profile.fullName ?? "--"}
              />
            )}
            <AvatarFallback className="bg-muted">
              <Gallery className="size-5 text-muted-foreground" />
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
        {[
          { label: "Hồ sơ cá nhân", icon: User },
          { label: "Cài đặt tài khoản", icon: Settings },
          { label: "Trợ giúp", icon: CircleHelp },
        ].map(({ label, icon: Icon }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <DropdownMenuItem
                aria-disabled="true"
                className="text-muted-foreground"
                onSelect={(event) => event.preventDefault()}
              >
                <Icon />
                {label}
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent side="left">
              {label} — tính năng sắp có
            </TooltipContent>
          </Tooltip>
        ))}
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

export function PageTitleBar({ title, breadcrumbs }: PageTitleBarProps) {
  const { toggleSidebar } = useSidebar()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()

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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Thông báo"
            >
              <Bell />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Thông báo — tính năng sắp có</TooltipContent>
        </Tooltip>

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

        <UserMenu isLoggingOut={isLoggingOut} onLogout={() => logout()} />
      </div>
    </header>
  )
}
