import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "web-qlsx-start"

export const Fallbacks = () => (
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarFallback>NH</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>TL</AvatarFallback>
    </Avatar>
    <Avatar className="size-12">
      <AvatarFallback>PT</AvatarFallback>
    </Avatar>
  </div>
)

export const Group = () => (
  <AvatarGroup>
    <Avatar>
      <AvatarFallback>NH</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>TL</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>PT</AvatarFallback>
    </Avatar>
    <AvatarGroupCount>+5</AvatarGroupCount>
  </AvatarGroup>
)
