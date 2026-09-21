import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { LayersMinimalistic } from "@solar-icons/react"

import { withForm } from "@/hooks/use-app-form"
import { ProductImageField } from "@/features/products/components/composites/ProductImageField"
import { itemBomQueryOptions } from "@/features/products/api/options"
import { updateBomItemFormDefaultValues } from "@/features/products/schemas/update-bom-item.schema"
import { unitOptionsQueryOptions } from "@/features/units/api"
import { UploadType } from "@/lib/types/file.type"
import { buildSelectOptions } from "@/lib/utils"

// The form instance is owned by BomItemDetailPage, because the header's "Lưu"
// button sits outside this panel and submits the same form — same split as
// ProductInfoTab/UpdateProductInfoSection. `disabled` folds both "no
// items:bom-manage permission" and "a save is in flight" — the caller decides,
// this component just renders. `bomItemType` is looked up here via a hook
// instead of being threaded down as a prop — only caller is BomItemDetailScreen,
// same route, and `itemBomQueryOptions` is already warm in the query cache
// (BomItemDetailPage's own useSuspenseQuery for the same key), so this is a
// cache read, not a second request.
export const BomItemInfoTab = withForm({
  defaultValues: updateBomItemFormDefaultValues,
  props: {
    disabled: false,
  },
  render: function Render({ form, disabled }) {
    const { productId, bomItemId } = useParams({
      from: "/(authed)/manage_/products_/$productId_/bom/$bomItemId",
    })
    const { data: nodes } = useSuspenseQuery(itemBomQueryOptions(productId))
    const bomItemType = nodes.find((node) => node.id === bomItemId)?.type

    // Route loader (`$bomItemId.tsx`) đã prefetch danh sách này.
    const { data: unitOptions } = useSuspenseQuery(unitOptionsQueryOptions())
    const unitSelectOptions = buildSelectOptions(unitOptions)

    return (
      <div>
        <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayersMinimalistic className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Thông tin chung
            </h2>
            <p className="text-sm text-muted-foreground">
              Thông tin định danh và số lượng của hạng mục này trong cấu trúc
              BOM
            </p>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              {bomItemType === "COMPONENT" ? (
                <>
                  <form.AppField name="code">
                    {(field) => (
                      <field.TextField
                        label="Mã"
                        required
                        disabled={disabled}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="name">
                    {(field) => (
                      <field.TextField
                        label="Tên"
                        required
                        disabled={disabled}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="unitId">
                    {(field) => (
                      <field.SelectField
                        label="Đơn vị tính"
                        placeholder="Chọn đơn vị tính"
                        options={unitSelectOptions}
                        disabled={disabled}
                      />
                    )}
                  </form.AppField>
                </>
              ) : null}

              {/* Thứ tự sắp xếp (sortOrder) không có ô sửa ở đây — không nằm trong defaultValues (xem
                  getBomItemDefaultValues), nên form không gửi key này lên PATCH — giữ nguyên thứ tự
                  hiện tại theo đúng ngữ nghĩa "thiếu key = không đổi" của update-bom-item.schema.ts. */}
              <form.AppField name="quantity">
                {(field) => (
                  <field.NumberField
                    label="Số lượng"
                    required
                    disabled={disabled}
                  />
                )}
              </form.AppField>

              <form.AppField name="note">
                {(field) => (
                  <field.TextareaField
                    label="Ghi chú"
                    placeholder="Ghi chú (nếu có)..."
                    disabled={disabled}
                    className="sm:col-span-2"
                  />
                )}
              </form.AppField>
            </div>

            {bomItemType === "COMPONENT" ? (
              <form.Field name="image">
                {(field) => (
                  <ProductImageField
                    value={field.state.value ?? null}
                    onChange={field.handleChange}
                    disabled={disabled}
                    uploadType={UploadType.BOM_ITEM_IMAGE}
                  />
                )}
              </form.Field>
            ) : null}
          </div>
        </div>
      </div>
    )
  },
})
