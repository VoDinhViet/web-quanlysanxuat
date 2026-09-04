import { useState } from "react"
import { revalidateLogic } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { ProductionJobNotes } from "@/features/production-jobs/components/composites/ProductionJobNotes"
import {
  productionJobNotesPageLimit,
  productionJobNotesQueryOptions,
} from "@/features/production-jobs/api/options"
import { createProductionJobNote } from "@/features/production-jobs/api/server-functions/create-production-job-note.api"
import { createProductionJobNoteSchema } from "@/features/production-jobs/schemas/create-production-job-note.schema"
import { useAppForm } from "@/hooks/use-app-form"

type ProductionJobNotesSectionProps = {
  productionJobId: string
}

// Sub-section of "Thông tin chung" (ProductionJobInfoTab.tsx's InfoSection) — a free-form
// conversation feed (GET/POST /production-jobs/:jobId/notes), sorted asc(createdAt) by the
// backend. `page` is local component state rather than a route search param: `page`/`limit` on
// this route already back the "materials" tab's list (production-job-detail-search.schema.ts), and this
// is a secondary section on a page with no pagination state of its own — same idiom as
// productionOrderLogsQueryOptions/ProductionOrderLogsCard. Feed rendering lives in the sibling
// ProductionJobNotes to keep this file focused on the mutation/form it owns.
export function ProductionJobNotesSection({
  productionJobId,
}: ProductionJobNotesSectionProps) {
  const [page, setPage] = useState(1)
  const notesQuery = useQuery({
    ...productionJobNotesQueryOptions(productionJobId, page),
    placeholderData: keepPreviousData,
  })

  const queryClient = useQueryClient()
  const createProductionJobNoteFn = useServerFn(createProductionJobNote)

  const { mutate: createNote, isPending } = useMutation({
    mutationFn: (content: string) =>
      createProductionJobNoteFn({ data: { productionJobId, content } }),
    onSuccess: async () => {
      // The feed reads oldest-first, so a new note lands on the last page — jump there so the
      // poster actually sees it land.
      const totalRecords = (notesQuery.data?.pagination.totalRecords ?? 0) + 1
      setPage(Math.ceil(totalRecords / productionJobNotesPageLimit))
      await queryClient.invalidateQueries({ queryKey: ["production-jobs"] })
      form.reset()
      toast.success("Đã thêm ghi chú")
    },
    onError: (error) => toast.error(error.message),
  })

  const form = useAppForm({
    defaultValues: { content: "" },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createProductionJobNoteSchema.pick({ content: true }),
    },
    onSubmit: ({ value }) => createNote(value.content),
  })

  return (
    <div className="flex flex-col gap-3">
      <ProductionJobNotes
        notes={notesQuery.data?.data}
        pagination={notesQuery.data?.pagination}
        isPending={notesQuery.isPending}
        isError={notesQuery.isError}
        errorMessage={notesQuery.error?.message}
        onPageChange={setPage}
      />

      <PermissionGate permission="production:update">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (form.state.isSubmitting) return
            form.handleSubmit()
          }}
          className="flex flex-col gap-2 border-t border-border pt-3"
        >
          <form.AppField name="content">
            {(field) => (
              <field.TextareaField
                label="Thêm ghi chú"
                required
                placeholder="Nhập ghi chú cho Job..."
                disabled={isPending}
              />
            )}
          </form.AppField>
          <Button
            type="submit"
            size="sm"
            className="self-end"
            isDisabled={isPending}
          >
            {isPending ? "Đang gửi..." : "Gửi ghi chú"}
          </Button>
        </form>
      </PermissionGate>
    </div>
  )
}
