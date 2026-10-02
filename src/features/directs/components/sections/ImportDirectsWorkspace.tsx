import { useCallback, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { DangerCircle } from "@solar-icons/react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Surface } from "@/components/shared/layouts/Surface"
import { downloadDirectImportTemplate } from "@/features/directs/api/server-functions/download-direct-import-template.api"
import { importDirects } from "@/features/directs/api/server-functions/import-directs.api"
import { previewImportDirects } from "@/features/directs/api/server-functions/preview-import-directs.api"
import { ImportDirectsGuideCard } from "@/features/directs/components/composites/ImportDirectsGuideCard"
import { ImportDirectsPreviewCard } from "@/features/directs/components/composites/ImportDirectsPreviewCard"
import { ImportDirectsUploadCard } from "@/features/directs/components/composites/ImportDirectsUploadCard"
import { downloadBase64File, XLSX_MIME_TYPE } from "@/lib/download-file"
import type { DirectImportPreviewRow } from "@/lib/types/direct.type"

export function ImportDirectsWorkspace() {
  const navigate = useNavigate({ from: "/manage/directs/import" })
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<DirectImportPreviewRow[]>([])
  const [clientError, setClientError] = useState<string | null>(null)

  const goToDirects = () =>
    navigate({ to: "/manage/directs", search: { page: 1, limit: 10 } })

  const previewFn = useServerFn(previewImportDirects)
  const importFn = useServerFn(importDirects)
  const templateFn = useServerFn(downloadDirectImportTemplate)

  const previewMutation = useMutation({
    mutationFn: (selected: File) => {
      const formData = new FormData()
      formData.append("file", selected)
      return previewFn({ data: formData })
    },
    onSuccess: setRows,
  })

  const importMutation = useMutation({
    mutationFn: (current: DirectImportPreviewRow[]) =>
      importFn({
        data: {
          rows: current.map((row) => ({
            rowNumber: row.rowNumber,
            ...row.values,
          })),
        },
      }),
    onSuccess: async () => {
      toast.success("Đã nhập vật tư từ file Excel")
      void queryClient.invalidateQueries({ queryKey: ["directs"] })
      await goToDirects()
    },
  })

  const templateMutation = useMutation({
    mutationFn: () => templateFn(),
    onSuccess: ({ base64, filename }) =>
      downloadBase64File(base64, filename, XLSX_MIME_TYPE),
  })

  const resetImport = importMutation.reset

  const handleFileChange = (selected: File | undefined) => {
    previewMutation.reset()
    resetImport()
    setClientError(null)
    setRows([])
    setFile(selected ?? null)

    if (selected) {
      previewMutation.mutate(selected)
    }
  }

  const handleFileReject = (message: string) => {
    handleFileChange(undefined)
    setClientError(message)
  }

  const handleRowSave = useCallback(
    (rowNumber: number, values: DirectImportPreviewRow["values"]) => {
      resetImport()
      setRows((current) =>
        current.map((row) =>
          row.rowNumber === rowNumber ? { ...row, values } : row
        )
      )
    },
    [resetImport]
  )

  const handleDeleteRow = useCallback(
    (rowNumber: number) => {
      resetImport()
      setRows((current) => current.filter((row) => row.rowNumber !== rowNumber))
    },
    [resetImport]
  )

  const errorMessage =
    clientError ??
    previewMutation.error?.message ??
    importMutation.error?.message ??
    templateMutation.error?.message ??
    null

  return (
    <>
      {errorMessage && (
        <Alert variant="destructive">
          <DangerCircle />
          <AlertDescription className="max-h-60 overflow-y-auto leading-relaxed whitespace-pre-line">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <Surface contentClassName="xl:grid xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col">
          <ImportDirectsUploadCard
            file={file}
            isPending={previewMutation.isPending}
            rowCount={rows.length}
            onFileChange={handleFileChange}
            onFileReject={handleFileReject}
          />
          <ImportDirectsPreviewCard
            rows={rows}
            isPending={importMutation.isPending}
            onRowSave={handleRowSave}
            onDeleteRow={handleDeleteRow}
            onCancel={() => void goToDirects()}
            onSubmit={() => importMutation.mutate(rows)}
          />
        </div>
        <ImportDirectsGuideCard
          isTemplatePending={templateMutation.isPending}
          onDownloadTemplate={() => templateMutation.mutate()}
        />
      </Surface>
    </>
  )
}
