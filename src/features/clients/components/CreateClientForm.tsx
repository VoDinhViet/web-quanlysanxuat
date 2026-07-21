import { Activity, useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AlertOctagon,
  ArrowRight,
  FileText,
  Loader2,
  RotateCcw,
} from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAppForm } from "@/hooks/use-app-form"
import { restoreFormDraft, useFormDraft } from "@/hooks/use-form-draft"
import { CreateClientContactsSection } from "@/features/clients/components/CreateClientContactsSection"
import { CreateClientInfoSection } from "@/features/clients/components/CreateClientInfoSection"
import {
  CREATE_CLIENT_DEFAULT_VALUES,
  createClientSchema,
} from "@/features/clients/schemas/create-client.schema"
import { createClient } from "@/features/clients/server-functions/create-client"
import type { CreateClientSchema } from "@/features/clients/schemas/create-client.schema"
import type { ClientGroupRef } from "@/features/clients/types/client.type"

type CreateClientFormProps = {
  clientGroupOptions: ClientGroupRef[]
}

export function CreateClientForm({
  clientGroupOptions,
}: CreateClientFormProps) {
  const navigate = useNavigate({ from: "/manage/clients/create" })
  const queryClient = useQueryClient()
  const createClientFn = useServerFn(createClient)

  const { draft, saveDraft, clearDraft } = useFormDraft<CreateClientSchema>(
    "qlsx:draft:create-client"
  )
  const draftRestoredRef = useRef(false)

  const createClientMutation = useMutation({
    mutationFn: (value: CreateClientSchema) => createClientFn({ data: value }),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["clients"] })
      await navigate({ to: "/manage/clients", search: { page: 1, limit: 10 } })
    },
  })

  const isPending = createClientMutation.isPending
  const error = createClientMutation.error?.message ?? null

  const form = useAppForm({
    defaultValues: CREATE_CLIENT_DEFAULT_VALUES,
    validators: {
      onSubmit: createClientSchema,
    },
    onSubmit: ({ value }) => createClientMutation.mutate(value),
  })

  // Auto-restore a saved draft into the form once, after localStorage hydrates.
  useEffect(() => {
    if (!draftRestoredRef.current && draft) {
      draftRestoredRef.current = true
      restoreFormDraft(form, draft)
    }
  }, [draft, form])

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
      <Activity mode={error ? "visible" : "hidden"}>
        <Alert className="border-destructive/20 bg-destructive/10 text-destructive">
          <AlertOctagon className="size-4" />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      </Activity>

      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <CreateClientInfoSection
          form={form}
          disabled={isPending}
          clientGroupOptions={clientGroupOptions}
        />

        <CreateClientContactsSection form={form} disabled={isPending} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
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
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                form.reset()
                restoreFormDraft(form, CREATE_CLIENT_DEFAULT_VALUES)
                clearDraft()
              }}
            >
              <RotateCcw className="size-4" />
              Đặt lại
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                saveDraft(form.state.values)
                toast.success("Đã lưu nháp")
              }}
            >
              <FileText className="size-4" />
              Lưu nháp
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
                      Tiếp tục
                      <ArrowRight />
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </div>
    </form>
  )
}
