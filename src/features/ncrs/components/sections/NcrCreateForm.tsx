import { revalidateLogic } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Layers, User } from "@solar-icons/react"
import { toast } from "sonner"

import type { ComboboxOption } from "@/components/shared/composites/ComboboxField"
import { RadioCardField } from "@/components/shared/composites/RadioCardField"
import type { RadioCardOption } from "@/components/shared/composites/RadioCardField"
import { useGetClientOptions } from "@/features/clients/api"
import { createNcr } from "@/features/ncrs/api/server-functions/create-ncr.api"
import { NcrCreateStepCard } from "@/features/ncrs/components/layouts/NcrCreateStepCard"
import { NcrItemStep } from "@/features/ncrs/components/sections/NcrItemStep"
import { NcrOrderClientStep } from "@/features/ncrs/components/sections/NcrOrderClientStep"
import { NcrDefectDetailsStep } from "@/features/ncrs/components/sections/NcrDefectDetailsStep"
import { NcrCreateSummaryCard } from "@/features/ncrs/components/composites/NcrCreateSummaryCard"
import {
  createNcrFormDefaultValues,
  createNcrSchema,
} from "@/features/ncrs/schemas/create-ncr.schema"
import type { CreateNcrSchema } from "@/features/ncrs/schemas/create-ncr.schema"
import { useAppForm } from "@/hooks/use-app-form"
import {
  ncrTypeDescriptions,
  ncrTypeLabels,
  NcrType,
} from "@/lib/types/ncr.type"
import type { Item } from "@/lib/types/item.type"
import type { Order } from "@/lib/types/order.type"

const typeCardOptions: RadioCardOption<NcrType>[] = [
  {
    value: NcrType.INTERNAL,
    label: ncrTypeLabels[NcrType.INTERNAL],
    description: ncrTypeDescriptions[NcrType.INTERNAL],
    icon: Layers,
    activeClassName: "border-primary",
    chipClassName: "bg-info-soft text-info-ink",
    badgeClassName: "bg-primary text-primary-foreground",
  },
  {
    value: NcrType.CUSTOMER,
    label: ncrTypeLabels[NcrType.CUSTOMER],
    description: ncrTypeDescriptions[NcrType.CUSTOMER],
    icon: User,
    activeClassName: "border-primary",
    chipClassName: "bg-warning-soft text-warning-ink",
    badgeClassName: "bg-primary text-primary-foreground",
  },
]

// Manual NCR-NB / NCR-KH. NCR-NB from an OQC sàng lọc is created by the backend, never here.
export function NcrCreateForm() {
  const navigate = useNavigate({ from: "/manage/ncrs/create" })
  const queryClient = useQueryClient()
  const createNcrFn = useServerFn(createNcr)

  const [selectedItem, setSelectedItem] = useState<Item>()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedClient, setSelectedClient] = useState<ComboboxOption>()
  const client = useGetClientOptions()

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateNcrSchema) => createNcrFn({ data: value }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ncrs"] }),
        queryClient.invalidateQueries({
          queryKey: ["reports", "pending-approvals"],
        }),
      ])
      toast.success("Đã tạo NCR")
      await navigate({ to: "/manage/ncrs", search: { page: 1, limit: 10 } })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: createNcrFormDefaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: createNcrSchema },
    onSubmit: ({ value }) => create(value),
  })

  function handleItemChange(item: Item | undefined) {
    setSelectedItem(item)
    // The order list belongs to one product, so a stale pick must not outlive it.
    form.setFieldValue("orderId", "")
    setSelectedOrder(null)
  }

  function handleOrderSelect(order: Order | null) {
    form.setFieldValue("orderId", order?.id ?? "")
    setSelectedOrder(order)
    if (!order?.client) return
    form.setFieldValue("clientId", order.client.id)
    setSelectedClient({ value: order.client.id, label: order.client.name })
  }

  function handleClientChange(clientId: string) {
    setSelectedClient(
      client.options.find((option) => option.value === clientId)
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
    >
      <form.Subscribe selector={(state) => state.values}>
        {(values) => (
          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex flex-col gap-4">
              <NcrCreateStepCard
                step={1}
                title="Loại NCR"
                description="NCR nội bộ hay phản hồi từ khách hàng"
                isDone
              >
                <form.Field name="type">
                  {(field) => (
                    <RadioCardField
                      field={field}
                      options={typeCardOptions}
                      disabled={isPending}
                    />
                  )}
                </form.Field>
              </NcrCreateStepCard>

              <NcrItemStep
                form={form}
                disabled={isPending}
                selectedItem={selectedItem}
                onItemChange={handleItemChange}
              />

              <NcrOrderClientStep
                form={form}
                disabled={isPending}
                isCustomerNcr={values.type === NcrType.CUSTOMER}
                selectedItem={selectedItem}
                selectedClient={selectedClient}
                orderId={values.orderId}
                isDone={values.orderId !== "" || values.clientId !== ""}
                clientPicker={client}
                onOrderSelect={handleOrderSelect}
                onClientChange={handleClientChange}
              />

              <NcrDefectDetailsStep
                form={form}
                disabled={isPending}
                isCustomerNcr={values.type === NcrType.CUSTOMER}
                unitName={selectedItem?.unit.name}
                isDone={
                  values.ngQty !== undefined ||
                  values.departmentId !== "" ||
                  values.defectDescription !== ""
                }
              />
            </div>

            <NcrCreateSummaryCard
              typeLabel={ncrTypeLabels[values.type]}
              itemLabel={
                selectedItem && `${selectedItem.code} — ${selectedItem.name}`
              }
              orderCode={values.orderId ? selectedOrder?.code : undefined}
              clientName={values.clientId ? selectedClient?.label : undefined}
              ngQtyLabel={
                values.ngQty === undefined
                  ? undefined
                  : `${values.ngQty} ${selectedItem?.unit.name ?? ""}`.trim()
              }
              isPending={isPending}
            />
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}
