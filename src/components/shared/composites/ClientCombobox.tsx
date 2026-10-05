import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useDebounceValue } from "usehooks-ts"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { clientQueryOptions, clientsQueryOptions } from "@/features/clients/api"
import type { Client } from "@/lib/types/client.type"

type ClientComboboxProps = {
  selectedClientId?: string
  onSelectClient: (clientId?: string) => void
}

export function ClientCombobox({
  selectedClientId,
  onSelectClient,
}: ClientComboboxProps) {
  const [q, setQ] = useDebounceValue("", 300)
  const [selected, setSelected] = useState<Client | null>(null)

  const { data: clients = [], isFetching } = useQuery({
    ...clientsQueryOptions({
      page: 1,
      limit: 20,
      q: q.trim() || undefined,
    }),
    select: ({ data }) => data,
    placeholderData: keepPreviousData,
  })

  // `selectedClientId` có thể đến từ URL (tải lại trang, link chia sẻ) khi chưa chọn gì trong
  // phiên này — lúc đó lấy tên khách hàng theo id để ô vẫn hiện đúng tên.
  const isRestoredFromId =
    Boolean(selectedClientId) && selected?.id !== selectedClientId
  const { data: restored } = useQuery({
    ...clientQueryOptions(selectedClientId ?? ""),
    enabled: isRestoredFromId,
  })
  const selectedClient = selectedClientId
    ? isRestoredFromId
      ? (restored ?? null)
      : selected
    : null

  return (
    <div>
      <Combobox
        items={clients}
        value={selectedClient}
        onValueChange={(client) => {
          setSelected(client)
          onSelectClient(client?.id)
        }}
        onInputValueChange={setQ}
        itemToStringLabel={(client) => client.name}
        isItemEqualToValue={(client, current) => client.id === current.id}
      >
        <ComboboxInput
          id="client-combobox"
          placeholder="Tìm khách hàng..."
          showClear={Boolean(selectedClientId)}
          className="w-full text-xs"
        />

        <ComboboxContent>
          <ComboboxEmpty>
            {isFetching ? "Đang tìm..." : "Không tìm thấy khách hàng"}
          </ComboboxEmpty>

          <ComboboxList>
            {clients.map((client) => (
              <ComboboxItem key={client.id} value={client}>
                {client.name}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
