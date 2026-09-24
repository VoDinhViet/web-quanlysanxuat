import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { clientQueryOptions } from "@/features/clients/api"
import { ClientPickerDialog } from "@/features/orders/components/composites/ClientPickerDialog"
import type { Client } from "@/lib/types/client.type"

export type ClientPickerProps = {
  value: string | undefined
  onValueChange: (value: string | undefined) => void
  onClientSelect?: (client: Client | undefined) => void
  onBlur?: () => void
  isInvalid?: boolean
  disabled?: boolean
  onApplyAddress?: (address: string) => void
}

export function ClientPicker({
  value,
  onValueChange,
  onClientSelect,
  onBlur,
  isInvalid,
  disabled,
}: ClientPickerProps) {
  const [open, setOpen] = useState(false)

  const clientDetailQuery = useQuery({
    ...clientQueryOptions(value!),
    enabled: !!value,
  })

  const selectedClient = clientDetailQuery.data

  function handleSelectClient(client: Client) {
    onValueChange(client.id)
    onClientSelect?.(client)
    setOpen(false)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onValueChange(undefined)
    onClientSelect?.(undefined)
  }

  return (
    <>
      {value ? (
        !selectedClient ? (
          <div className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        ) : (
          <div className="relative flex w-full items-center">
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onBlur={onBlur}
              onClick={() => setOpen(true)}
              aria-invalid={isInvalid}
              className="w-full justify-between pr-14 font-normal"
            >
              <span className="truncate font-medium text-foreground">
                {selectedClient.name}
              </span>
            </Button>
            <div className="pointer-events-none absolute right-2 flex items-center gap-0.5">
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleClear}
                  title="Bỏ chọn"
                  aria-label="Bỏ chọn khách hàng"
                  className="pointer-events-auto text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </Button>
              )}
              <ChevronDown className="size-4 opacity-50" />
            </div>
          </div>
        )
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onBlur={onBlur}
          onClick={() => setOpen(true)}
          aria-invalid={isInvalid}
          className="w-full justify-between font-normal text-muted-foreground hover:text-foreground"
        >
          <span>Chọn khách hàng...</span>
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      )}

      <ClientPickerDialog
        open={open}
        onOpenChange={setOpen}
        selectedId={value}
        onSelect={handleSelectClient}
      />
    </>
  )
}
