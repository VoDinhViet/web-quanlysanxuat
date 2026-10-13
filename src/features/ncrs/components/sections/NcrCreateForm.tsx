import { revalidateLogic } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"
import { toast } from "sonner"

import { ComboboxField } from "@/components/shared/composites/ComboboxField"
import { Surface } from "@/components/shared/layouts/Surface"
import { Button, LinkButton } from "@/components/ui/button"
import { useGetClientOptions } from "@/features/clients/api"
import { departmentQueryOptions } from "@/features/departments/api"
import { createNcr } from "@/features/ncrs/api/server-functions/create-ncr.api"
import {
  createNcrFormDefaultValues,
  createNcrSchema,
} from "@/features/ncrs/schemas/create-ncr.schema"
import type { CreateNcrSchema } from "@/features/ncrs/schemas/create-ncr.schema"
import { ordersQueryOptions } from "@/features/orders/api"
import { itemOptionsQueryOptions } from "@/features/products/api"
import { useAppForm } from "@/hooks/use-app-form"
import { ncrTypeLabels, NcrType } from "@/lib/types/ncr.type"
import { buildOptionsFromLabels, buildSelectOptions } from "@/lib/utils"

const typeOptions = buildOptionsFromLabels(ncrTypeLabels)

// Manual NCR-NB / NCR-KH. NCR-NB from an OQC sàng lọc is created by the backend, never here.
export function NcrCreateForm() {
  const navigate = useNavigate({ from: "/manage/ncrs/create" })
  const queryClient = useQueryClient()
  const createNcrFn = useServerFn(createNcr)

  const [itemQuery, setItemQuery] = useDebounceValue("", 300)
  const [orderQuery, setOrderQuery] = useDebounceValue("", 300)
  const { data: items = [], isFetching: isItemsFetching } = useQuery({
    ...itemOptionsQueryOptions({ q: itemQuery, type: "FG" }),
    placeholderData: keepPreviousData,
  })
  const { data: orders, isFetching: isOrdersFetching } = useQuery({
    ...ordersQueryOptions({ page: 1, limit: 20, q: orderQuery || undefined }),
    placeholderData: keepPreviousData,
  })
  const { data: departments = [], isPending: isDepartmentsPending } = useQuery(
    departmentQueryOptions()
  )
  const client = useGetClientOptions()

  const itemOptions = items.map((item) => ({
    value: item.id,
    label: `${item.code} — ${item.name}`,
  }))
  const orderOptions = (orders?.data ?? []).map((order) => ({
    value: order.id,
    label: order.code,
  }))

  const { mutate: create, isPending } = useMutation({
    mutationFn: (value: CreateNcrSchema) => createNcrFn({ data: value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["ncrs"] })
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

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (form.state.isSubmitting) return
        form.handleSubmit()
      }}
      noValidate
      className="flex flex-col gap-4"
    >
      <Surface>
        <div className="space-y-5 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <form.AppField name="type">
              {(field) => (
                <field.SelectField
                  label="Loại NCR"
                  required
                  options={typeOptions}
                  disabled={isPending}
                />
              )}
            </form.AppField>

            <form.Field name="itemId">
              {(field) => (
                <ComboboxField
                  id={field.name}
                  label="Sản phẩm"
                  required
                  placeholder="Chọn sản phẩm"
                  value={field.state.value || undefined}
                  onValueChange={(next) => field.handleChange(next ?? "")}
                  onBlur={field.handleBlur}
                  isInvalid={
                    field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0
                  }
                  errors={field.state.meta.errors}
                  options={itemOptions}
                  onSearchChange={setItemQuery}
                  isPending={isItemsFetching}
                  emptyMessage="Không tìm thấy sản phẩm"
                  disabled={isPending}
                />
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.type}>
              {(type) => (
                <form.Field name="clientId">
                  {(field) => (
                    <ComboboxField
                      id={field.name}
                      label="Khách hàng"
                      required={type === NcrType.CUSTOMER}
                      placeholder="Chọn khách hàng"
                      value={field.state.value || undefined}
                      onValueChange={(next) => field.handleChange(next ?? "")}
                      onBlur={field.handleBlur}
                      isInvalid={
                        field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0
                      }
                      errors={field.state.meta.errors}
                      options={client.options}
                      onSearchChange={client.onSearchChange}
                      isPending={client.isFetching}
                      emptyMessage="Không tìm thấy khách hàng"
                      disabled={isPending}
                    />
                  )}
                </form.Field>
              )}
            </form.Subscribe>

            <form.Field name="orderId">
              {(field) => (
                <ComboboxField
                  id={field.name}
                  label="Đơn hàng (SO) — cần để tạo LSX"
                  placeholder="Chọn đơn hàng"
                  value={field.state.value || undefined}
                  onValueChange={(next) => field.handleChange(next ?? "")}
                  onBlur={field.handleBlur}
                  options={orderOptions}
                  onSearchChange={setOrderQuery}
                  isPending={isOrdersFetching}
                  emptyMessage="Không tìm thấy đơn hàng"
                  disabled={isPending}
                />
              )}
            </form.Field>

            <form.AppField name="departmentId">
              {(field) => (
                <field.SelectField
                  label="Bộ phận phát sinh"
                  placeholder="Chọn bộ phận"
                  options={buildSelectOptions(departments)}
                  isPending={isDepartmentsPending}
                  disabled={isPending}
                />
              )}
            </form.AppField>

            <form.AppField name="ngQty">
              {(field) => (
                <field.NumberField
                  label="SL hàng lỗi"
                  placeholder="0"
                  disabled={isPending}
                />
              )}
            </form.AppField>
          </div>

          <form.AppField name="defectDescription">
            {(field) => (
              <field.TextareaField
                label="Mô tả lỗi"
                placeholder="Mô tả lỗi / nội dung khách hàng phản hồi"
                maxLength={1000}
                disabled={isPending}
              />
            )}
          </form.AppField>
        </div>
      </Surface>

      <div className="flex justify-end gap-2">
        <LinkButton
          to="/manage/ncrs"
          search={{ page: 1, limit: 10 }}
          variant="outline"
        >
          Hủy
        </LinkButton>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Đang tạo..." : "Tạo NCR"}
        </Button>
      </div>
    </form>
  )
}
