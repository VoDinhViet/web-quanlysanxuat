import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        // Deliberately borderless, unlike stock shadcn: every status badge in the
        // app used `outline` purely to inherit the base sizing, then killed the
        // border again with `border-transparent`. The base already supplies
        // `border border-transparent`, so this keeps that. Regenerating this file
        // with the shadcn CLI will silently restore `border-border`.
        success: "bg-success-soft text-success-ink",
        warning: "bg-warning-soft text-warning-ink",
        info: "bg-info-soft text-info-ink",
        violet: "bg-violet-soft text-violet-ink",
        neutral: "bg-neutral-soft text-neutral-ink",
        outline:
          "text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // `outline` swaps the tinted fill for a coloured hairline (tone variants only).
      appearance: {
        soft: "",
        outline: "",
      },
    },
    compoundVariants: (
      [
        "success",
        "warning",
        "info",
        "violet",
        "neutral",
        "destructive",
      ] as const
    ).map((variant) => ({
      variant,
      appearance: "outline" as const,
      className: "border-current/35 bg-transparent",
    })),
    defaultVariants: {
      variant: "default",
      appearance: "soft",
    },
  }
)

function Badge({
  className,
  variant = "default",
  appearance = "soft",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, appearance }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
      appearance,
    },
  })
}

export { Badge, badgeVariants }
