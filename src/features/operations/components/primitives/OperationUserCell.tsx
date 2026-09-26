import { Gallery } from "@solar-icons/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { resolveFileUrl } from "@/lib/file-url"
import type { UserListItem } from "@/lib/types/user.type"

type OperationUserCellProps = {
  user: UserListItem
}

// Avatar + full name, the identity cell shared by the assigned-staff table and the bulk-assign dialog.
export function OperationUserCell({ user }: OperationUserCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-9">
        {user.avatar && (
          <AvatarImage
            src={resolveFileUrl(user.avatar.url)}
            alt={user.fullName}
          />
        )}
        <AvatarFallback className="bg-muted">
          <Gallery className="size-5 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <span className="max-w-48 min-w-0 truncate text-xs font-medium text-foreground">
        {user.fullName}
      </span>
    </div>
  )
}
