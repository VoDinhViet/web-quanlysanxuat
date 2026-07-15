import { Image } from "@unpic/react"
import { Link, useLocation } from "@tanstack/react-router"
import {
  ArrowDownToLine,
  Boxes,
  ClipboardList,
  Factory,
  FileText,
  GitBranch,
  History,
  LayoutDashboard,
  ListChecks,
  PackageMinus,
  PackagePlus,
  PackageSearch,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserRound,
  Users,
  Warehouse,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { isKnownRoute } from "@/lib/known-routes"

type MenuItem = {
  label: string
  icon: LucideIcon
  href?: string
}

type MenuGroup = {
  label: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    label: "Tổng quan",
    items: [
      { label: "Bảng điều khiển", icon: LayoutDashboard, href: "/manage" },
    ],
  },
  {
    label: "Quản lý bán hàng",
    items: [
      { label: "Đơn hàng (SO)", icon: ShoppingCart, href: "/manage/orders" },
      { label: "Báo giá (RFQ)", icon: FileText },
      { label: "Giao hàng (DO)", icon: Truck },
      { label: "Khách hàng", icon: UserRound, href: "/manage/clients" },
    ],
  },
  {
    label: "Quản lý mua hàng",
    items: [
      { label: "Đề xuất mua hàng", icon: ClipboardList },
      { label: "Đơn mua hàng (PO)", icon: ReceiptText },
      { label: "Nhà cung cấp", icon: Users, href: "/manage/suppliers" },
      { label: "Nhập hàng", icon: ArrowDownToLine },
    ],
  },
  {
    label: "Quản lý sản xuất",
    items: [
      { label: "Sản phẩm", icon: PackageSearch, href: "/manage/products" },
      { label: "Lệnh sản xuất (Job)", icon: Factory },
      { label: "Quản lý sản xuất", icon: GitBranch },
      { label: "Công đoạn sản xuất", icon: GitBranch },
      { label: "BOM & Định mức", icon: ListChecks },
    ],
  },
  {
    label: "Quản lý kho",
    items: [
      { label: "Nhập kho", icon: PackagePlus },
      { label: "Xuất kho", icon: PackageMinus },
      { label: "Tồn kho vật tư", icon: Warehouse },
      { label: "Tồn kho thành phẩm", icon: Boxes },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { label: "Nhân sự", icon: UserRound, href: "/manage/users" },
      { label: "Phân quyền", icon: ShieldCheck },
      { label: "Cài đặt", icon: Settings },
      { label: "Nhật ký hệ thống", icon: History },
    ],
  },
]

const menuButtonClass =
  "h-9 px-3 text-[13px] font-medium text-sidebar-foreground/82 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-white data-[active=true]:shadow-[0_8px_18px_rgba(20,61,255,0.24)] data-[active=true]:[&_svg]:text-white [&_svg]:size-[17px]"

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="items-center px-3 pt-7 pb-5 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="Cơ khí Tiến Huy"
              className="h-auto w-full justify-center p-0 hover:bg-transparent"
            >
              <Link to="/manage" className="flex w-full min-w-0 justify-center">
                <SidebarBrand />
                <span className="hidden size-10 items-center justify-center group-data-[collapsible=icon]:flex">
                  <Image
                    src="/tien-huy-logo-mark-transparent.png"
                    alt="Cơ khí Tiến Huy"
                    width={28}
                    height={28}
                    className="block shrink-0 object-contain"
                    loading="eager"
                  />
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-3 px-2.5 py-4">
        {menuGroups.map((group) => (
          <MenuGroup
            key={group.label}
            group={group}
            pathname={location.pathname}
          />
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}

function SidebarBrand() {
  return (
    <span className="flex min-w-0 flex-col items-center gap-2 text-center group-data-[collapsible=icon]:hidden">
      <span className="flex size-18 items-center justify-center">
        <Image
          src="/tien-huy-logo-mark-transparent.png"
          alt="Cơ khí Tiến Huy"
          width={56}
          height={56}
          className="block shrink-0 object-contain"
          loading="eager"
        />
      </span>

      <span className="min-w-0">
        <span className="block truncate text-base leading-5 font-bold tracking-tight text-sidebar-foreground">
          CƠ KHÍ TIẾN HUY
        </span>
        <span className="mt-1 block truncate text-[8px] leading-3.5 font-semibold tracking-widest text-sidebar-foreground/58 uppercase">
          ERP - Hệ thống quản trị sản xuất
        </span>
      </span>
    </span>
  )
}

function MenuGroup({
  group,
  pathname,
}: {
  group: MenuGroup
  pathname: string
}) {
  return (
    <SidebarGroup className="gap-1 p-0">
      <SidebarGroupLabel className="h-7 px-3 text-[10px] font-semibold tracking-[0.1em] text-sidebar-foreground/52 uppercase">
        {group.label}
      </SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {group.items.map((item) => (
            <MenuButton key={item.label} item={item} pathname={pathname} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function MenuButton({ item, pathname }: { item: MenuItem; pathname: string }) {
  const Icon = item.icon
  const isActive = pathname === item.href

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.label}
        asChild={Boolean(item.href)}
        isActive={isActive}
        className={menuButtonClass}
        type={item.href ? undefined : "button"}
      >
        {item.href && isKnownRoute(item.href) ? (
          <Link to={item.href}>
            <Icon />
            <span>{item.label}</span>
          </Link>
        ) : item.href ? (
          <a href={item.href}>
            <Icon />
            <span>{item.label}</span>
          </a>
        ) : (
          <>
            <Icon />
            <span>{item.label}</span>
          </>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
