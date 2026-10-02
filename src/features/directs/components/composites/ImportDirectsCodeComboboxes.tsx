import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"
import type { ComponentProps } from "react"

import { ComboboxField } from "@/components/shared/composites/ComboboxField"
import { clientOptionsQueryOptions } from "@/features/clients/api"
import { suppliersQueryOptions } from "@/features/suppliers/api"

type CodeComboboxProps = Pick<
  ComponentProps<typeof ComboboxField>,
  "id" | "label" | "onBlur" | "isInvalid" | "errors"
> & {
  value: string
  onValueChange: (code: string) => void
}

type CodeRef = { code: string; name: string }

function toCodeOption({ code, name }: CodeRef) {
  return { value: code, label: `${code} — ${name}` }
}

// Rows reference suppliers by code, so the combobox value is the code. Both lists are searched
// server-side (a tenant can have a huge number of rows) instead of loading them whole.
export function SupplierCodeCombobox({
  value,
  onValueChange,
  ...props
}: CodeComboboxProps) {
  const [q, setQ] = useDebounceValue("", 300)
  const { data, isFetching } = useQuery({
    ...suppliersQueryOptions({ page: 1, limit: 20, q: q || undefined }),
    placeholderData: keepPreviousData,
  })

  return (
    <ComboboxField
      {...props}
      placeholder="Chọn nhà cung cấp"
      value={value || undefined}
      onValueChange={(next) => onValueChange(next ?? "")}
      options={(data?.data ?? []).map(toCodeOption)}
      onSearchChange={setQ}
      isPending={isFetching}
      initialOption={value ? { value, label: value } : undefined}
      emptyMessage="Không tìm thấy nhà cung cấp"
    />
  )
}

export function ClientCodeCombobox({
  value,
  onValueChange,
  ...props
}: CodeComboboxProps) {
  const [q, setQ] = useDebounceValue("", 300)
  const { data = [], isFetching } = useQuery({
    ...clientOptionsQueryOptions(q),
    placeholderData: keepPreviousData,
  })

  return (
    <ComboboxField
      {...props}
      placeholder="Chọn khách hàng"
      value={value || undefined}
      onValueChange={(next) => onValueChange(next ?? "")}
      options={data.map(toCodeOption)}
      onSearchChange={setQ}
      isPending={isFetching}
      initialOption={value ? { value, label: value } : undefined}
      emptyMessage="Không tìm thấy khách hàng"
    />
  )
}
