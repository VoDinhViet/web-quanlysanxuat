import { DateTime } from "luxon"
import { Icon } from "@iconify/react"
import userBold from "@iconify-icons/solar/user-bold"
import { Edit3 } from "lucide-react"
import type { ReactNode } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { IconButton } from "@/components/shared/IconButton"
import {
  EMPLOYEE_STATUS_LABELS,
  EmployeeStatus,
  USER_GENDER_LABELS,
} from "@/features/users/types/user.type"
import type { User } from "@/features/users/types/user.type"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"

export function UserDetails({
  user,
  trigger,
}: {
  user: User
  trigger: ReactNode
}) {
  const displayName = user.fullName
  const dateOfBirth = user.dateOfBirth
    ? DateTime.fromISO(user.dateOfBirth).toFormat("dd/MM/yyyy")
    : "—"
  const hireDate = DateTime.fromISO(user.hireDate).toFormat("dd/MM/yyyy")
  const gender = USER_GENDER_LABELS[user.gender]
  const isWorking = user.status === EmployeeStatus.WORKING

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="gap-0 overflow-y-auto p-0 data-[side=right]:w-full sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle>Chi tiết nhân sự</SheetTitle>
          <SheetDescription>{displayName}</SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="info" className="h-full gap-0">
          <div className="border-b border-border px-4 pt-4">
            <TabsList
              variant="line"
              className="h-10 w-full justify-start gap-6 rounded-none p-0"
            >
              <TabsTrigger
                value="info"
                className="h-10 flex-none px-0 text-xs font-medium text-muted-foreground data-active:text-foreground"
              >
                Thông tin chi tiết
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="h-10 flex-none px-0 text-xs font-medium text-muted-foreground data-active:text-foreground"
              >
                Lịch sử hoạt động
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="info" className="m-0 outline-none">
            <div className="border-b border-border px-4 py-5">
              <div className="flex items-start gap-4">
                <Avatar className="size-20">
                  <AvatarImage
                    src={
                      user.avatar ? resolveFileUrl(user.avatar.url) : undefined
                    }
                    alt={displayName}
                  />
                  <AvatarFallback>
                    <Icon icon={userBold} className="size-3/5" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="truncate text-base font-semibold text-foreground">
                      {displayName}
                    </h2>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 border-transparent px-2 text-[10px] font-medium",
                        isWorking
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                      )}
                    >
                      {EMPLOYEE_STATUS_LABELS[user.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs font-medium text-foreground">
                    {user.position.name}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {user.department.name}
                  </p>
                  <div className="mt-3 space-y-1 text-xs font-medium text-foreground">
                    <p>{user.email ?? "—"}</p>
                    <p>{user.phoneNumber ?? "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            <DetailsSection title="Thông tin chung" editable>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <DetailItem label="Mã nhân viên" value={user.code} />
                <DetailItem label="Ngày sinh" value={dateOfBirth} />
                <DetailItem label="Giới tính" value={gender} />
                <DetailItem label="Ngày vào làm" value={hireDate} />
                <DetailItem label="Số CCCD" value={user.idNumber ?? "—"} />
                <DetailItem
                  label="Tên đăng nhập"
                  value={user.credential?.username ?? "—"}
                />
              </div>
              <DetailItem
                className="mt-4"
                label="Địa chỉ"
                value={user.address ?? "—"}
              />
              <div className="mt-5 space-y-4">
                <FormPreview label="Phòng ban" value={user.department.name} />
                <FormPreview
                  required
                  label="Chức vụ"
                  value={user.position.name}
                />
              </div>
            </DetailsSection>

            <DetailsSection title="Ghi chú" editable>
              <Textarea
                readOnly
                value={user.note ?? "-"}
                className="min-h-24 resize-none border-0 bg-transparent px-0 py-0 text-xs font-medium text-muted-foreground shadow-none focus-visible:ring-0"
              />
            </DetailsSection>
          </TabsContent>

          <TabsContent value="history" className="m-0 outline-none">
            <div className="px-4 py-6 text-xs font-medium text-muted-foreground">
              Chưa có lịch sử hoạt động.
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

function DetailsSection({
  title,
  editable,
  children,
}: {
  title: string
  editable?: boolean
  children: ReactNode
}) {
  return (
    <section className="border-b border-border px-4 py-4 last:border-b-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">
          {title}
        </h3>
        {editable ? (
          <IconButton
            size="icon-xs"
            className="bg-background text-foreground"
            label={`Chỉnh sửa ${title.toLowerCase()}`}
          >
            <Edit3 className="size-3.5" />
          </IconButton>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="text-xs font-medium break-words text-foreground">{value}</p>
    </div>
  )
}

function FormPreview({
  label,
  value,
  required,
}: {
  label: string
  value: string
  required?: boolean
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-foreground">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </span>
      <Input
        readOnly
        value={value}
        className="h-9 bg-background text-xs font-medium"
      />
    </label>
  )
}
