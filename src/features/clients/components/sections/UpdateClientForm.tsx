import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { UpdateClientContactsSection } from "@/features/clients/components/sections/UpdateClientContactsSection"
import { UpdateClientInfoSection } from "@/features/clients/components/sections/UpdateClientInfoSection"
import { updateClientSchema } from "@/features/clients/schemas/update-client.schema"
import { updateClient } from "@/features/clients/api/server-functions/update-client.api"
import type { UpdateClientSchema } from "@/features/clients/schemas/update-client.schema"
import type { Client } from "@/lib/types/client.type"

// Client → raw form values: nullable fields become "", contacts drop the
// server-assigned id/isPrimary back down to the editable shape (isPrimary is
// re-derived from array order on submit, see clientContactsSchema).
function getClientDefaultValues(client: Client): UpdateClientSchema {
  return {
    clientId: client.id,
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
}

export function UpdateClientForm({ client }: UpdateClientFormProps) {
  const navigate = useNavigate({ from: "/manage/clients/$clientId/update" })
  const queryClient = useQueryClient()
  const updateClientFn = useServerFn(updateClient)

  const { mutate: update, isPending } = useMutation({
    mutationFn: (value: UpdateClientSchema) => updateClientFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clients"] })
      await navigate({ to: "/manage/clients", search: { page: 1, limit: 10 } })
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: getClientDefaultValues(client),
    validators: {
      onSubmit: updateClientSchema,
    },
    onSubmit: ({ value }) => update(value),
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
      className="space-y-6"
    >
      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <UpdateClientInfoSection form={form} disabled={isPending} />

        <UpdateClientContactsSection form={form} disabled={isPending} />

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
