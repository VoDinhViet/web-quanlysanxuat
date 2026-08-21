import { Image } from "@unpic/react"
import { Link, useLocation } from "@tanstack/react-router"
import {
  BookText,
  Boxes,
  Building2,
  ClipboardCheck,
  ClipboardList,
  ClipboardMinus,
  CreditCard,
  Factory,
  FileText,
  GitBranch,
  LayoutDashboard,
  Layers,
  PackageCheck,
  PackageMinus,
  PackagePlus,
  PackageSearch,
  ReceiptText,
  Send,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Undo2,
  Upload,
  UserRound,
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
import { hasPermission } from "@/features/auth/permissions"
import { requiredPermissionForPath } from "@/features/auth/route-permissions"
import { usePermissions } from "@/hooks/use-permissions"
import type { ManageRoutePath } from "@/features/auth/route-permissions"
import type { PermissionCode } from "@/lib/types/permission.type"

type MenuItem = {
  label: string
  icon: LucideIcon
  // Typed against the generated route tree, not a plain `string` — a href pointing at a route
  // that doesn't exist is now a compile error instead of a silent `<a>` fallback. A domain with no
  // page yet omits `href` entirely (see the placeholder items below) rather than pointing it at a
  // path that isn't real yet. A linked item derives its required permission from
  // `routePermissions` via this href — it must NOT also set `permission` below.
  href?: ManageRoutePath
  // Placeholder items only (no page yet, so no route to derive from). Ignored when `href`
  // is set — the route map wins. Every item — linked or placeholder — must resolve to some
  // permission, so a menu entry can never outlive the group-emptying filter below.
  permission?: PermissionCode
}

/** The permission required to see `item` — via its route if linked, else its own field. */
function requiredPermission(item: MenuItem): PermissionCode | null {
  return item.href
    ? requiredPermissionForPath(item.href)
    : (item.permission ?? null)
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
      {
        label: "Đơn hàng (SO)",
        icon: ShoppingCart,
        href: "/manage/orders",
      },
      {
        label: "Giao hàng (DO)",
        icon: Truck,
        href: "/manage/outbound-orders",
      },
    ],
  },
  {
    label: "Quản lý mua hàng",
    items: [
      {
        label: "Đề xuất mua hàng",
        icon: ClipboardList,
        href: "/manage/purchase-requests",
      },
      {
        label: "Báo giá NCC (RFQ)",
        icon: FileText,
        href: "/manage/purchase-quotations",
      },
      {
        label: "Danh mục mua hàng",
        icon: BookText,
        href: "/manage/purchase-ledger",
      },
      {
        label: "Đơn mua hàng (PO)",
        icon: ReceiptText,
        href: "/manage/purchase-orders",
      },
      {
        label: "Yêu cầu thanh toán",
        icon: CreditCard,
        href: "/manage/payment-requests",
      },
      {
        label: "Trả NCC",
        icon: Undo2,
        href: "/manage/supplier-returns",
      },
    ],
  },
  {
    label: "Kiểm tra chất lượng (QC)",
    items: [
      {
        label: "IQC",
        icon: ClipboardCheck,
        href: "/manage/iqc",
      },
      {
        label: "OQC",
        icon: PackageCheck,
        href: "/manage/oqc",
      },
    ],
  },
  {
    label: "Quản lý sản xuất",
    items: [
      {
        label: "Lệnh sản xuất (LSX)",
        icon: Factory,
        href: "/manage/production-orders",
      },
      {
        label: "Quản lý sản xuất",
        icon: GitBranch,
        href: "/manage/production-jobs",
      },
      {
        label: "Lãnh vật tư",
        icon: ClipboardMinus,
        href: "/manage/material-issues",
      },
    ],
  },
  {
    label: "Gia công ngoài",
    items: [
      {
        label: "Xuất đi gia công (OS-OUT)",
        icon: Send,
        href: "/manage/outsourcing-orders",
      },
      {
        label: "Nhập về (OS-IN)",
        icon: Upload,
        href: "/manage/outsourcing-receipts",
      },
    ],
  },
  {
    label: "Quản lý kho",
    items: [
      {
        label: "Nhập kho",
        icon: PackagePlus,
        href: "/manage/inventory-receipts",
      },
      {
        label: "Xuất kho",
        icon: PackageMinus,
        href: "/manage/inventory-issues",
      },
      {
        label: "Tồn kho vật tư",
        icon: Warehouse,
        href: "/manage/inventory-materials",
      },
      {
        label: "Tồn kho thành phẩm",
        icon: Boxes,
        href: "/manage/inventory-products",
      },
    ],
  },
  {
    label: "Danh mục",
    items: [
      {
        label: "Khách hàng",
        icon: UserRound,
        href: "/manage/clients",
      },
      {
        label: "Nhà cung cấp",
        icon: Building2,
        href: "/manage/suppliers",
      },
      {
        label: "Sản phẩm",
        icon: PackageSearch,
        href: "/manage/products",
      },
      {
        label: "Vật tư",
        icon: Layers,
        href: "/manage/materials",
      },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      {
        label: "Nhân sự",
        icon: UserRound,
        href: "/manage/users",
      },
      { label: "Phân quyền", icon: ShieldCheck, permission: "roles:read" },
    ],
  },
]

const menuButtonClass =
  "h-9 px-3 text-[13px] font-medium text-sidebar-foreground/82 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-[0_8px_18px_-2px_color-mix(in_oklch,var(--sidebar-primary)_45%,transparent)] data-[active=true]:[&_svg]:text-sidebar-primary-foreground [&_svg]:size-[17px]"

export function AppSidebar() {
  const location = useLocation()
  const permissions = usePermissions()

  // Hide items the user can't open — a linked item reuses the same access map the router
  // guard reads, so a menu entry can never disagree with its route — then drop any group
  // left empty.
  const visibleGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const required = requiredPermission(item)
        return required === null || hasPermission(permissions, required)
      }),
    }))
    .filter((group) => group.items.length > 0)

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
        {visibleGroups.map((group) => (
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
        {item.href ? (
          <Link to={item.href}>
            <Icon />
            <span>{item.label}</span>
          </Link>
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
