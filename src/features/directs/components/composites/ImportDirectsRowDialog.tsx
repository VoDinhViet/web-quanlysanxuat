import { useMemo } from "react"
import { revalidateLogic } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { DangerCircle, Diskette } from "@solar-icons/react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  fieldGroups,
  getImportField,
  placeholders,
  textareaKeys,
  textareaMaxLength,
} from "@/features/directs/constants/import-direct-form-fields"
import { getRowErrors } from "@/features/directs/constants/import-direct-rows"
import {
  ClientCodeCombobox,
  SupplierCodeCombobox,
} from "@/features/directs/components/composites/ImportDirectsCodeComboboxes"
import { unitOptionsQueryOptions } from "@/features/units/api"
import { importDirectRowSchema } from "@/features/directs/schemas/import-direct-row.schema"
import { useAppForm } from "@/hooks/use-app-form"
import { cn } from "@/lib/utils"
import type { DirectImportPreviewRow } from "@/lib/types/direct.type"

type ImportDirectsRowDialogProps = {
  row: DirectImportPreviewRow | null
  onSave: (rowNumber: number, values: DirectImportPreviewRow["values"]) => void
  onClose: () => void
}

export function ImportDirectsRowDialog({
  row,
  onSave,
  onClose,
}: ImportDirectsRowDialogProps) {
  return (
    <Dialog open={row !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[min(92svh,52rem)] flex-col gap-0 p-0 sm:max-w-5xl">
        {row && (
          <ImportDirectsRowForm row={row} onSave={onSave} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}

type ImportDirectsRowFormProps = {
  row: DirectImportPreviewRow
  onSave: ImportDirectsRowDialogProps["onSave"]
  onClose: () => void
}

function ImportDirectsRowForm({
  row,
  onSave,
  onClose,
}: ImportDirectsRowFormProps) {
  const form = useAppForm({
    defaultValues: row.values,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: importDirectRowSchema },
    onSubmit: ({ value }) => onSave(row.rowNumber, value),
  })

  const { data: units = [], isPending: isUnitsPending } = useQuery(
    unitOptionsQueryOptions()
  )
  const unitOptions = useMemo(() => {
    const options = units.map((unit) => ({
      value: unit.code,
      label: `${unit.code} — ${unit.name}`,
    }))
    const { unitCode } = row.values

    // A unit code from the file that the system doesn't know stays visible so the user can replace it.
    if (unitCode && !units.some((unit) => unit.code === unitCode)) {
      options.unshift({
        value: unitCode,
        label: `${unitCode} (không có trong hệ thống)`,
      })
    }

    return options
  }, [units, row.values])
  const currentErrors = Object.values(getRowErrors(row))

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <DialogHeader className="gap-1 border-b border-border/60 px-6 py-4">
        <DialogTitle className="text-base font-semibold">
          Sửa vật tư — dòng {row.rowNumber}
        </DialogTitle>
        <DialogDescription className="text-xs leading-normal">
          Chỉnh lại thông tin của dòng này, các trường có dấu * là bắt buộc.
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="min-h-0 flex-1">
        {currentErrors.length > 0 && (
          <Alert variant="destructive" className="mx-6 mt-5 w-auto">
            <DangerCircle />
            <AlertDescription>
              Dòng này đang có {currentErrors.length} lỗi cần sửa.
            </AlertDescription>
          </Alert>
        )}

        {fieldGroups.map(
          ({ title, description, icon: Icon, iconClassName, keys }) => (
            <section
              key={title}
              className="border-b border-border/60 px-6 py-5 last:border-b-0"
            >
              <div className="mb-4 flex items-start gap-3">
                <Icon className={cn("mt-0.5 size-5 shrink-0", iconClassName)} />
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              <div className="grid gap-x-4 gap-y-3 sm:grid-cols-3">
                {keys.map((key) =>
                  key === "supplierCode" || key === "clientCode" ? (
                    <form.Field key={key} name={key}>
                      {(field) => {
                        const Combobox =
                          key === "supplierCode"
                            ? SupplierCodeCombobox
                            : ClientCodeCombobox

                        return (
                          <Combobox
                            id={field.name}
                            label={getImportField(key).label}
                            value={field.state.value}
                            onValueChange={field.handleChange}
                            onBlur={field.handleBlur}
                            isInvalid={
                              field.state.meta.isTouched &&
                              field.state.meta.errors.length > 0
                            }
                            errors={field.state.meta.errors}
                          />
                        )
                      }}
                    </form.Field>
                  ) : (
                    <form.AppField key={key} name={key}>
                      {(field) =>
                        key === "unitCode" ? (
                          <field.SelectField
                            label={getImportField(key).label}
                            required
                            placeholder="Chọn đơn vị tính"
                            options={unitOptions}
                            isPending={isUnitsPending}
                          />
                        ) : textareaKeys.includes(key) ? (
                          <field.TextareaField
                            label={getImportField(key).label}
                            placeholder={placeholders[key]}
                            maxLength={textareaMaxLength[key]}
                            className="sm:col-span-3"
                          />
                        ) : (
                          <field.TextField
                            label={getImportField(key).label}
                            required={getImportField(key).required}
                            placeholder={placeholders[key]}
                          />
                        )
                      }
                    </form.AppField>
                  )
                )}
              </div>
            </section>
          )
        )}
      </ScrollArea>

      <DialogFooter className="gap-2 border-t border-border/60 px-6 py-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" className="gap-1.5">
          <Diskette className="size-4" />
          Lưu thay đổi
        </Button>
      </DialogFooter>
    </form>
  )
}
