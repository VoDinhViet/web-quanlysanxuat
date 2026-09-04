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
import { TableEmpty } from "@/components/shared/primitives/TableEmpty"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { withForm } from "@/hooks/use-app-form"
import { ClientContactDialog } from "@/features/clients/components/composites/ClientContactDialog"
import { createClientFormDefaultValues } from "@/features/clients/schemas/create-client.schema"
import type { ClientContactInput } from "@/features/clients/schemas/client-contact.schema"

export const CreateClientContactsSection = withForm({
  defaultValues: createClientFormDefaultValues,
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
                  isDisabled={disabled}
                  onPress={openAdd}
                >
                  <Plus className="size-4" />
                  Thêm người liên hệ
                </Button>
              </div>

              <div className="mt-4 overflow-hidden rounded-md border border-border/50 bg-card">
                <Table aria-label="Danh sách người liên hệ">
                  <TableHeader className="[&>tr]:h-12 [&>tr]:hover:bg-muted/45">
                    <TableHead id="index" className="w-12">
                      #
                    </TableHead>
                    <TableHead id="name" isRowHeader>
                      Họ và tên
                    </TableHead>
                    <TableHead id="position">Chức vụ</TableHead>
                    <TableHead id="phoneNumber">Điện thoại</TableHead>
                    <TableHead id="email">Email</TableHead>
                    <TableHead id="note">Ghi chú</TableHead>
                    <TableHead id="actions" className="w-24 text-right">
                      Thao tác
                    </TableHead>
                  </TableHeader>
                  <TableBody
                    renderEmptyState={() => (
                      <TableEmpty
                        colSpan={7}
                        title="Chưa có người liên hệ"
                        description="Bấm “Thêm người liên hệ” để thêm."
                      />
                    )}
                  >
                    {contacts.map((contact, index) => (
                      <TableRow
                        key={index}
                        id={index}
                        className="h-14 bg-card hover:bg-muted/25"
                      >
                        <TableCell className="text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>{contact.name}</TableCell>
                        <TableCell>{contact.position || "—"}</TableCell>
                        <TableCell>{contact.phoneNumber || "—"}</TableCell>
                        <TableCell>{contact.email || "—"}</TableCell>
                        <TableCell className="max-w-48 truncate">
                          {contact.note || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <TooltipTrigger>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                aria-label={`Sửa người liên hệ ${index + 1}`}
                                className="text-muted-foreground hover:border-primary/30 hover:text-primary"
                                isDisabled={disabled}
                                onPress={() => openEdit(index)}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Tooltip>{`Sửa người liên hệ ${index + 1}`}</Tooltip>
                            </TooltipTrigger>
                            <TooltipTrigger>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                aria-label={`Xóa người liên hệ ${index + 1}`}
                                className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                                isDisabled={disabled}
                                onPress={() => contactsField.removeValue(index)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                              <Tooltip>{`Xóa người liên hệ ${index + 1}`}</Tooltip>
                            </TooltipTrigger>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
