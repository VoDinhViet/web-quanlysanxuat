import { Badge } from "@/components/ui/badge"
import { updateNcrFormDefaultValues } from "@/features/ncrs/schemas/update-ncr.schema"
import { withForm } from "@/hooks/use-app-form"

type NcrQuantitySplitProps = {
  disabled: boolean
  isNgQtyLocked: boolean
  unitName: string | undefined
}

const defaultProps: NcrQuantitySplitProps = {
  disabled: false,
  isNgQtyLocked: false,
  unitName: undefined,
}

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// NG quantity split into repair / remake, with the rest shown as "chỉ ghi nhận".
export const NcrQuantitySplit = withForm({
  defaultValues: updateNcrFormDefaultValues,
  props: defaultProps,
  render: function Render({ form, disabled, isNgQtyLocked, unitName }) {
    const unitSuffix = unitName ? ` (${unitName})` : ""

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
          <form.AppField name="ngQty">
            {(field) => (
              <field.NumberField
                label={`SL hàng lỗi${unitSuffix}`}
                placeholder="0"
                description={
                  isNgQtyLocked
                    ? "Lấy theo SL NG của phiếu OQC"
                    : "Tổng số lượng không đạt"
                }
                disabled={disabled || isNgQtyLocked}
              />
            )}
          </form.AppField>
          <form.AppField name="reworkQty">
            {(field) => (
              <field.NumberField
                label={`SL sửa chữa${unitSuffix}`}
                placeholder="0"
                description="Hàng sửa lại để đạt yêu cầu"
                disabled={disabled}
              />
            )}
          </form.AppField>
          <form.AppField name="remakeQty">
            {(field) => (
              <field.NumberField
                label={`SL làm mới${unitSuffix}`}
                placeholder="0"
                description="Hàng sản xuất lại từ đầu"
                disabled={disabled}
              />
            )}
          </form.AppField>
        </div>

        <form.Subscribe
          selector={(state) => ({
            ngQty: state.values.ngQty,
            reworkQty: state.values.reworkQty,
            remakeQty: state.values.remakeQty,
          })}
        >
          {({ ngQty, reworkQty, remakeQty }) => {
            const recordOnlyQty = ngQty - reworkQty - remakeQty

            return (
              <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/70">
                <span>Phân bổ {quantityFormatter.format(ngQty)} hàng lỗi:</span>
                <Badge variant="warning">
                  Sửa chữa {quantityFormatter.format(reworkQty)}
                </Badge>
                <Badge variant="info">
                  Làm mới {quantityFormatter.format(remakeQty)}
                </Badge>
                {recordOnlyQty < 0 ? (
                  <Badge variant="destructive">
                    Vượt {quantityFormatter.format(-recordOnlyQty)}
                  </Badge>
                ) : (
                  <Badge variant="neutral">
                    Chỉ ghi nhận {quantityFormatter.format(recordOnlyQty)}
                  </Badge>
                )}
              </div>
            )
          }}
        </form.Subscribe>
      </div>
    )
  },
})
