import { createLink } from "@tanstack/react-router"
import {
  Breadcrumb as BreadcrumbPrimitive,
  Breadcrumbs as BreadcrumbsPrimitive,
  composeRenderProps,
  Link as LinkPrimitive,
} from "react-aria-components"

import { cn } from "@/lib/utils"
import { IconChevronRight, IconDots } from "@tabler/icons-react"
import type * as React from "react"
import type {
  BreadcrumbProps,
  BreadcrumbsProps,
  LinkProps,
} from "react-aria-components"

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn(className)}
      {...props}
    />
  )
}

function BreadcrumbList<T extends object>({
  className,
  ...props
}: BreadcrumbsProps<T>) {
  return (
    <BreadcrumbsPrimitive
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground sm:gap-2.5",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({
  className,
  children,
  separatorClassName,
  ...props
}: BreadcrumbProps & { separatorClassName?: string }) {
  return (
    <BreadcrumbPrimitive
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    >
      {composeRenderProps(children, (children, { isCurrent }) => (
        <>
          {children}
          {!isCurrent && (
            <span
              data-slot="breadcrumb-separator"
              role="presentation"
              aria-hidden="true"
              className={cn("[&>svg]:size-3.5", separatorClassName)}
            >
              <IconChevronRight />
            </span>
          )}
        </>
      ))}
    </BreadcrumbPrimitive>
  )
}

// Router-compatible breadcrumb link, same TanStack Router pattern as LinkButton in
// button.tsx (https://tanstack.com/router/latest/docs/how-to/integrate-shadcn-ui).
const BreadcrumbLink = createLink(
  ({ className, render, ...props }: LinkProps) => (
    <LinkPrimitive
      {...props}
      render={render}
      data-slot="breadcrumb-link"
      className={cn("transition-colors hover:text-foreground", className)}
    />
  )
)

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex size-5 items-center justify-center [&>svg]:size-4",
        className
      )}
      {...props}
    >
      <IconDots />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbEllipsis,
}
