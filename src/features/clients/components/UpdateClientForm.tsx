import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { CreateClientContactsSection } from "@/features/clients/components/CreateClientContactsSection"
import { CreateClientInfoSection } from "@/features/clients/components/CreateClientInfoSection"
import { clientFormSchema } from "@/features/clients/schemas/client-form.schema"
import { updateClient } from "@/features/clients/server-functions/update-client"
import type { ClientFormSchema } from "@/features/clients/schemas/client-form.schema"
import type { Client, ClientGroupRef } from "@/lib/types/client.type"

// Client → raw form values: nullable fields become "", contacts drop the
// server-assigned id/isPrimary back down to the editable shape (isPrimary is
// re-derived from array order on submit, see clientContactsSchema).
function buildClientDefaultValues(client: Client): ClientFormSchema {
  return {
    name: client.name,
    clientGroupId: client.group.id,
    taxCode: client.taxCode ?? "",
    phoneNumber: client.phoneNumber ?? "",
    email: client.email ?? "",
    address: client.address ?? "",
    note: client.note ?? "",
    status: client.status,
    contacts: client.contacts.map((contact) => ({
      name: contact.name,
      position: contact.position ?? "",
      phoneNumber: contact.phoneNumber ?? "",
      email: contact.email ?? "",
      note: contact.note ?? "",
    })),
  }
}

type UpdateClientFormProps = {
  client: Client
  clientGroupOptions: ClientGroupRef[]
}

export function UpdateClientForm({
  client,
  clientGroupOptions,
}: UpdateClientFormProps) {
  const navigate = useNavigate({ from: "/manage/clients/$clientId/update" })
  const queryClient = useQueryClient()
  const updateClientFn = useServerFn(updateClient)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: ClientFormSchema) =>
      updateClientFn({ data: { ...value, clientId: client.id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clients"] })
      await navigate({ to: "/manage/clients", search: { page: 1, limit: 10 } })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: buildClientDefaultValues(client),
    validators: {
      onSubmit: clientFormSchema,
    },
    onSubmit: ({ value }) => update(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      noValidate
      className="space-y-6"
    >
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <CreateClientInfoSection
          form={form}
          disabled={isPending}
          clientGroupOptions={clientGroupOptions}
        />

        <CreateClientContactsSection form={form} disabled={isPending} />

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              void navigate({
                to: "/manage/clients",
                search: { page: 1, limit: 10 },
              })
            }
          >
            Hủy
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || isPending}
              >
                {isSubmitting || isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Đang lưu
                  </>
                ) : (
                  <>
                    <Save />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  )
}
