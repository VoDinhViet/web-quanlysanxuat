import { useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmptyRow } from "@/components/shared/TableEmptyRow"
import { withForm } from "@/hooks/use-app-form"
import { ClientContactDialog } from "@/features/clients/components/ClientContactDialog"
import { CREATE_CLIENT_DEFAULT_VALUES } from "@/features/clients/schemas/create-client.schema"
import type { ClientContactInput } from "@/features/clients/schemas/create-client.schema"

export const CreateClientContactsSection = withForm({
  defaultValues: CREATE_CLIENT_DEFAULT_VALUES,
  props: { disabled: false },
  render: function Render({ form, disabled }) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)

    return (
      <form.Field name="contacts" mode="array">
        {(contactsField) => {
          const contacts = contactsField.state.value
          const editingContact =
            editingIndex !== null ? (contacts[editingIndex] ?? null) : null

          const openAdd = () => {
            setEditingIndex(null)
            setDialogOpen(true)
          }

          const openEdit = (index: number) => {
            setEditingIndex(index)
            setDialogOpen(true)
          }

          const handleSubmit = (value: ClientContactInput) => {
            if (editingIndex === null) {
              contactsField.pushValue(value)
            } else {
              contactsField.replaceValue(editingIndex, value)
            }
            setDialogOpen(false)
          }

          return (
            <div className="px-4 py-5 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-base font-semibold text-foreground">
                    Người liên hệ
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Có thể thêm nhiều người liên hệ cho khách hàng
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-primary/40 text-xs text-primary hover:bg-primary/5 hover:text-primary"
                  disabled={disabled}
                  onClick={openAdd}
                >
                  <Plus className="size-4" />
                  Thêm người liên hệ
                </Button>
              </div>

              <div className="mt-4 overflow-hidden rounded-md border border-border/50 bg-card">
                <Table className="text-xs [&_td]:border-r [&_td]:border-border/40 [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:border-border/40 [&_th:last-child]:border-r-0">
                  <TableHeader className="bg-muted/45">
                    <TableRow className="h-13 hover:bg-muted/45">
                      <TableHead className="w-12 px-4 text-xs font-semibold text-foreground">
                        #
                      </TableHead>
                      <TableHead className="px-4 text-xs font-semibold text-foreground">
                        Họ và tên
                      </TableHead>
                      <TableHead className="px-4 text-xs font-semibold text-foreground">
                        Chức vụ
                      </TableHead>
                      <TableHead className="px-4 text-xs font-semibold text-foreground">
                        Điện thoại
                      </TableHead>
                      <TableHead className="px-4 text-xs font-semibold text-foreground">
                        Email
                      </TableHead>
                      <TableHead className="px-4 text-xs font-semibold text-foreground">
                        Ghi chú
                      </TableHead>
                      <TableHead className="w-24 px-4 text-right text-xs font-semibold text-foreground">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.length === 0 ? (
                      <TableEmptyRow
                        colSpan={7}
                        message="Chưa có người liên hệ. Bấm “Thêm người liên hệ” để thêm."
                      />
                    ) : (
                      contacts.map((contact, index) => (
                        <TableRow
                          key={index}
                          className="h-14 bg-card hover:bg-muted/20"
                        >
                          <TableCell className="px-4 py-0 text-xs font-medium text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell className="px-4 py-0 text-xs font-medium text-foreground">
                            {contact.name}
                          </TableCell>
                          <TableCell className="px-4 py-0 text-xs font-medium text-foreground">
                            {contact.position || "—"}
                          </TableCell>
                          <TableCell className="px-4 py-0 text-xs font-medium text-foreground">
                            {contact.phoneNumber || "—"}
                          </TableCell>
                          <TableCell className="px-4 py-0 text-xs font-medium text-foreground">
                            {contact.email || "—"}
                          </TableCell>
                          <TableCell className="max-w-48 truncate px-4 py-0 text-xs font-medium text-foreground">
                            {contact.note || "—"}
                          </TableCell>
                          <TableCell className="px-4 py-0 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground hover:text-primary"
                                aria-label={`Sửa người liên hệ ${index + 1}`}
                                disabled={disabled}
                                onClick={() => openEdit(index)}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground hover:text-destructive"
                                aria-label={`Xóa người liên hệ ${index + 1}`}
                                disabled={disabled}
                                onClick={() => contactsField.removeValue(index)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <ClientContactDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialValue={editingContact}
                onSubmit={handleSubmit}
              />
            </div>
          )
        }}
      </form.Field>
    )
  },
})
