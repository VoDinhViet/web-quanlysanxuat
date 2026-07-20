import { Construction } from "lucide-react"

type ProductTabPlaceholderProps = {
  title: string
  description: string
}

export function ProductTabPlaceholder({
  title,
  description,
}: ProductTabPlaceholderProps) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Construction className="size-6" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="max-w-md text-xs font-medium text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
