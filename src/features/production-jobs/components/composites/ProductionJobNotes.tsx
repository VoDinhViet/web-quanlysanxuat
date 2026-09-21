import { DateTime } from "luxon"

import { Spinner } from "@/components/ui/spinner"
import { Pagination } from "@/components/shared/composites/Pagination"
import type { ProductionJobNote } from "@/lib/types/production-job.type"
import type { Pagination as PaginationMeta } from "@/lib/types/pagination.type"

type ProductionJobNotesProps = {
  notes: ProductionJobNote[] | undefined
  pagination: PaginationMeta | undefined
  isPending: boolean
  isError: boolean
  errorMessage: string | undefined
  onPageChange: (page: number) => void
}

// Feed + pager half of ProductionJobNotesSection, split out to keep that file under the ~150-line
// guideline — the form/mutation stays in the parent since it owns the mutation.
export function ProductionJobNotes({
  notes,
  pagination,
  isPending,
  isError,
  errorMessage,
  onPageChange,
}: ProductionJobNotesProps) {
  return (
    <>
      {isPending ? (
        <div className="flex items-center justify-center py-6">
          <Spinner className="size-5 text-muted-foreground" />
        </div>
      ) : isError ? (
        <p className="py-2 text-xs text-muted-foreground">{errorMessage}</p>
      ) : notes && notes.length === 0 ? (
        <p className="py-2 text-xs text-muted-foreground">Chưa có ghi chú.</p>
      ) : (
        <ul className="space-y-3">
          {notes?.map((note) => (
            <li key={note.id} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">
                  {note.creator?.fullName ?? "Hệ thống"}
                </span>
                <span>
                  {DateTime.fromISO(note.createdAt).toFormat(
                    "dd/MM/yyyy HH:mm"
                  )}
                </span>
              </div>
              <p className="mt-1.5 text-xs break-words whitespace-pre-wrap text-foreground">
                {note.content}
              </p>
            </li>
          ))}
        </ul>
      )}

      {pagination && (
        <Pagination
          page={pagination.currentPage}
          pageSize={pagination.limit}
          total={pagination.totalRecords}
          onPageChange={onPageChange}
        />
      )}
    </>
  )
}
