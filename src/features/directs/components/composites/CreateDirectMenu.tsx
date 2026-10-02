import type { ComponentType } from "react"
import {
  AddCircle,
  AltArrowDown,
  BoxMinimalistic,
  FileText,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type CreateDirectMenuItemProps = {
  to: "/manage/directs/create" | "/manage/directs/import"
  icon: ComponentType<IconProps>
  iconClassName: string
  title: string
  description: string
}

function CreateDirectMenuItem({
  to,
  icon: Icon,
  iconClassName,
  title,
  description,
}: CreateDirectMenuItemProps) {
  return (
    <DropdownMenuLinkItem to={to} className="items-start gap-3 p-2">
      <Icon className={cn("mt-0.5 size-5 shrink-0", iconClassName)} />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
    </DropdownMenuLinkItem>
  )
}

export function CreateDirectMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" className="text-xs">
            <AddCircle className="size-4" />
            Thêm vật tư
            <AltArrowDown className="size-3.5 opacity-70" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Chọn cách tạo vật tư</DropdownMenuLabel>
          <CreateDirectMenuItem
            to="/manage/directs/create"
            icon={BoxMinimalistic}
            iconClassName="text-primary"
            title="Tạo vật tư mới"
            description="Nhập thông tin từng vật tư"
          />
          <CreateDirectMenuItem
            to="/manage/directs/import"
            icon={FileText}
            iconClassName="text-success"
            title="Nhập từ Excel"
            description="Thêm nhiều vật tư cùng lúc từ file"
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
