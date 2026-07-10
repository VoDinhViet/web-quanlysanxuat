import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageTitleBar } from "@/components/shared/page-title-bar"
import { UsersTable } from "@/features/users/components/users-table"
import { UsersTableFilter } from "@/features/users/components/users-table-filter"
import type { User } from "@/features/users/types/user.type"
import { cn } from "@/lib/utils"

const maleAvatarFallbackSrc =
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-15.png"
const femaleAvatarFallbackSrc =
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png"

const users: User[] = [
  {
    id: "NV001",
    name: "Nguyễn Văn An",
    department: "Kinh doanh",
    position: "Trưởng phòng KD",
    email: "an.nguyen@tienhuy.com",
    phone: "0909 123 456",
    status: "Hoạt động",
    initials: "NA",
    avatarFallbackSrc: maleAvatarFallbackSrc,
    avatarClassName: "from-slate-200 to-slate-500 text-slate-950",
  },
  {
    id: "NV002",
    name: "Trần Thị Bình",
    department: "Kinh doanh",
    position: "Nhân viên KD",
    email: "binh.tran@tienhuy.com",
    phone: "0909 223 456",
    status: "Hoạt động",
    initials: "TB",
    avatarFallbackSrc: femaleAvatarFallbackSrc,
    avatarClassName: "from-rose-100 to-rose-400 text-rose-950",
  },
  {
    id: "NV003",
    name: "Lê Minh Cường",
    department: "Sản xuất",
    position: "Quản đốc SX",
    email: "cuong.le@tienhuy.com",
    phone: "0909 323 456",
    status: "Hoạt động",
    initials: "LC",
    avatarFallbackSrc: maleAvatarFallbackSrc,
    avatarClassName: "from-stone-100 to-stone-500 text-stone-950",
  },
  {
    id: "NV004",
    name: "Phạm Văn Dũng",
    department: "Sản xuất",
    position: "Nhân viên vận hành",
    email: "dung.pham@tienhuy.com",
    phone: "0909 423 456",
    status: "Hoạt động",
    initials: "PD",
    avatarFallbackSrc: maleAvatarFallbackSrc,
    avatarClassName: "from-sky-100 to-sky-500 text-sky-950",
  },
  {
    id: "NV005",
    name: "Hoàng Thị Em",
    department: "Kế hoạch",
    position: "Nhân viên kế hoạch",
    email: "em.hoang@tienhuy.com",
    phone: "0909 523 456",
    status: "Hoạt động",
    initials: "HE",
    avatarFallbackSrc: femaleAvatarFallbackSrc,
    avatarClassName: "from-pink-100 to-pink-400 text-pink-950",
  },
  {
    id: "NV006",
    name: "Đỗ Thị Hà",
    department: "Mua hàng",
    position: "Nhân viên mua hàng",
    email: "ha.do@tienhuy.com",
    phone: "0909 623 456",
    status: "Hoạt động",
    initials: "DH",
    avatarFallbackSrc: femaleAvatarFallbackSrc,
    avatarClassName: "from-violet-100 to-violet-400 text-violet-950",
  },
  {
    id: "NV007",
    name: "Trần Quốc Huy",
    department: "Kho",
    position: "Thủ kho",
    email: "huy.tran@tienhuy.com",
    phone: "0909 723 456",
    status: "Hoạt động",
    initials: "TH",
    avatarFallbackSrc: maleAvatarFallbackSrc,
    avatarClassName: "from-blue-100 to-blue-500 text-blue-950",
  },
  {
    id: "NV008",
    name: "Nguyễn Văn Kiên",
    department: "Kế toán",
    position: "Kế toán viên",
    email: "kien.nguyen@tienhuy.com",
    phone: "0909 823 456",
    status: "Tạm ngưng",
    initials: "NK",
    avatarFallbackSrc: maleAvatarFallbackSrc,
    avatarClassName: "from-zinc-100 to-zinc-500 text-zinc-950",
  },
  {
    id: "NV009",
    name: "Đinh Văn Lâm",
    department: "Kỹ thuật",
    position: "Kỹ sư thiết kế",
    email: "lam.dinh@tienhuy.com",
    phone: "0909 923 456",
    status: "Hoạt động",
    initials: "DL",
    avatarFallbackSrc: maleAvatarFallbackSrc,
    avatarClassName: "from-cyan-100 to-cyan-500 text-cyan-950",
  },
  {
    id: "NV010",
    name: "Vũ Thị Mai",
    department: "Hành chính",
    position: "Nhân viên HCNS",
    email: "mai.vu@tienhuy.com",
    phone: "0910 123 456",
    status: "Hoạt động",
    initials: "VM",
    avatarFallbackSrc: femaleAvatarFallbackSrc,
    avatarClassName: "from-fuchsia-100 to-fuchsia-400 text-fuchsia-950",
  },
]

export function UsersPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Quản lý nhân sự"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Hệ thống" },
          { label: "Nhân sự" },
        ]}
        notificationCount={5}
      />

      <div className="w-full p-4 sm:p-5 lg:p-6">
        <section className="overflow-hidden rounded-lg bg-card shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="grid min-h-[calc(100svh-8.5rem)] grid-cols-1">
            <div className="flex min-w-0 flex-col border-border">
              <UsersTableFilter />
              <UsersTable rows={users} />
              <TablePagination />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function TablePagination() {
  return (
    <div className="flex flex-col gap-3 px-4 py-4 text-xs font-medium text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-5">
      <p>Hiển thị 1 đến 10 trong tổng số 35 nhân sự</p>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <div className="flex items-center gap-2">
          <PaginationButton ariaLabel="Trang trước">
            <ChevronLeft className="size-4" />
          </PaginationButton>
          {[1, 2, 3, 4].map((page) => (
            <Button
              key={page}
              type="button"
              variant={page === 1 ? "default" : "outline"}
              size="icon-sm"
              className={cn(
                "text-xs font-medium",
                page !== 1 && "bg-background text-foreground"
              )}
            >
              {page}
            </Button>
          ))}
          <PaginationButton ariaLabel="Trang sau">
            <ChevronRight className="size-4" />
          </PaginationButton>
        </div>

        <Select defaultValue="10">
          <SelectTrigger className="h-9 w-28 bg-background text-xs font-medium text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 / trang</SelectItem>
            <SelectItem value="20">20 / trang</SelectItem>
            <SelectItem value="50">50 / trang</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function PaginationButton({
  ariaLabel,
  children,
}: {
  ariaLabel: string
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="bg-background text-foreground"
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  )
}
