import { useServerFn } from "@tanstack/react-start"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  BillList,
  Delivery,
  FileText,
  HandMoney,
  Notes,
  Sale,
  WalletMoney,
} from "@solar-icons/react"
import { useState } from "react"
import type { ComponentType, ReactNode } from "react"
import { toast } from "sonner"

import { NumericFormat } from "react-number-format"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updatePurchaseOrder } from "@/features/purchase-orders/api/server-functions/update-purchase-order.api"
import { updatePurchaseOrderAdvancePayment } from "@/features/purchase-orders/api/server-functions/update-purchase-order-advance-payment.api"
import { currencyFormatter } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { toVietnameseCurrencyWords } from "@/lib/vietnamese-number-words"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderCostsSectionProps = {
  purchaseOrder: PurchaseOrderDetail
  editable: boolean
  // Tạm ứng NCC sửa được rộng hơn VAT/chi phí khác: cả khi PO đã đặt, tới khi YCTT đã chi.
  advancePaymentEditable: boolean
}

type CostFieldsPayload = Partial<
  Pick<PurchaseOrderDetail, "vatPercent" | "otherCost" | "otherCostNote">
>

type SuffixedInputProps = {
  suffix: string
  children: ReactNode
}

// Đơn vị nằm trong ô (đè lên mép phải) để người nhập biết ô này nhập % hay tiền VNĐ.
function SuffixedInput({ suffix, children }: SuffixedInputProps) {
  return (
    <div className="relative w-full">
      {children}
      <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs font-medium text-muted-foreground">
        {suffix}
      </span>
    </div>
  )
}

type CostRowProps = {
  icon: ComponentType<{ className?: string }>
  label: string
  amount?: string
  control?: ReactNode
  // Ô nhập chiếm luôn cột số tiền (dòng "Chi phí khác": ô nhập chính là số tiền).
  controlSpansAmount?: boolean
}

// Một dòng tiền: ô icon + nhãn, rồi 2 cột cố định (ô nhập | số tiền) để mép số tiền luôn thẳng
// hàng giữa các dòng dù dòng đó có ô nhập hay không.
function CostRow({
  icon: Icon,
  label,
  amount,
  control,
  controlSpansAmount,
}: CostRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_7rem_8.5rem] items-center gap-x-3">
      <dt className="flex items-center gap-2.5 text-sm font-medium text-foreground">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
        {label}
      </dt>
      <dd
        className={cn(
          "flex items-center justify-end gap-1.5",
          controlSpansAmount ? "col-span-2" : "col-start-2"
        )}
      >
        {control}
      </dd>
      {amount !== undefined && (
        <dd className="col-start-3 row-start-1 text-right text-sm font-medium text-foreground tabular-nums">
          {amount}
        </dd>
      )}
    </div>
  )
}

// Khối thanh toán: trái là diễn giải + số tiền bằng chữ, phải là các dòng tiền (mỗi dòng một icon)
// và "Tổng thanh toán" trong dải nhấn màu. Chỉ nhập khi PO còn chờ xác nhận, sau đó chỉ xem. Mỗi ô
// lưu khi rời ô (cùng cách với đơn giá/ghi chú của PO); BE tính tiền VAT và tổng tiền nên chỉ cần
// tải lại chi tiết để thấy số mới.
export function PurchaseOrderCostsSection({
  purchaseOrder,
  editable,
  advancePaymentEditable,
}: PurchaseOrderCostsSectionProps) {
  const queryClient = useQueryClient()
  const updatePurchaseOrderFn = useServerFn(updatePurchaseOrder)
  const updateAdvancePaymentFn = useServerFn(updatePurchaseOrderAdvancePayment)
  const [advancePaymentAmount, setAdvancePaymentAmount] = useState<
    number | undefined
  >(purchaseOrder.advancePaymentAmount)
  const [advancePaymentNote, setAdvancePaymentNote] = useState(
    purchaseOrder.advancePaymentNote ?? ""
  )
  const hasAdvancePayment = purchaseOrder.advancePaymentAmount > 0
  // Ẩn hẳn khối tạm ứng khi không sửa được và chưa có tạm ứng — giữ giao diện cũ cho PO không dùng.
  const showAdvancePayment = advancePaymentEditable || hasAdvancePayment
  const payableAmount = purchaseOrder.balanceDue

  const { mutate: saveAdvancePayment } = useMutation({
    mutationFn: (payload: {
      advancePaymentAmount: number
      advancePaymentNote: string | null
    }) =>
      updateAdvancePaymentFn({
        data: { purchaseOrderId: purchaseOrder.id, ...payload },
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["payment-requests"] }),
      ])
    },
    onError: (error) => {
      toast.error(error.message)
      setAdvancePaymentAmount(purchaseOrder.advancePaymentAmount)
      setAdvancePaymentNote(purchaseOrder.advancePaymentNote ?? "")
    },
  })

  function submitAdvancePayment(next: { amount: number; note: string }) {
    const nextNote = next.note.trim() || null
    if (
      next.amount === purchaseOrder.advancePaymentAmount &&
      nextNote === purchaseOrder.advancePaymentNote
    ) {
      return
    }
    saveAdvancePayment({
      advancePaymentAmount: next.amount,
      advancePaymentNote: nextNote,
    })
  }
  const [vatPercent, setVatPercent] = useState<number | undefined>(
    purchaseOrder.vatPercent
  )
  const [otherCost, setOtherCost] = useState<number | undefined>(
    purchaseOrder.otherCost
  )
  const [otherCostNote, setOtherCostNote] = useState(
    purchaseOrder.otherCostNote ?? ""
  )

  const { mutate: save } = useMutation({
    mutationFn: (payload: CostFieldsPayload) =>
      updatePurchaseOrderFn({
        data: { purchaseOrderId: purchaseOrder.id, ...payload },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
    onError: (error) => {
      toast.error(error.message)
      setVatPercent(purchaseOrder.vatPercent)
      setOtherCost(purchaseOrder.otherCost)
      setOtherCostNote(purchaseOrder.otherCostNote ?? "")
    },
  })

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <label
            htmlFor="purchase-order-other-cost-note"
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <Notes className="size-4 text-muted-foreground" />
            Diễn giải chi phí khác
          </label>
          {editable ? (
            <>
              <Textarea
                id="purchase-order-other-cost-note"
                className="min-h-24 resize-y bg-card"
                placeholder="Vd: Phí vận chuyển về kho"
                maxLength={255}
                value={otherCostNote}
                onChange={(event) => setOtherCostNote(event.target.value)}
                onBlur={() => {
                  const nextNote = otherCostNote.trim() || null
                  if (nextNote === purchaseOrder.otherCostNote) return
                  save({ otherCostNote: nextNote })
                }}
              />
              <p className="text-xs text-muted-foreground">
                Các ô tự lưu khi bạn rời khỏi ô nhập.
              </p>
            </>
          ) : (
            <p className="rounded-md bg-muted/40 px-3 py-2.5 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {purchaseOrder.otherCostNote ?? "Không có diễn giải."}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2.5 rounded-md bg-muted/40 px-3 py-2.5 text-xs">
          <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p>
            <span className="text-muted-foreground">Bằng chữ: </span>
            <span className="font-medium text-foreground italic">
              {toVietnameseCurrencyWords(
                showAdvancePayment ? payableAmount : purchaseOrder.totalAmount
              )}
            </span>
          </p>
        </div>

        {showAdvancePayment && (
          <div className="space-y-2">
            <label
              htmlFor="purchase-order-advance-payment-note"
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <Notes className="size-4 text-muted-foreground" />
              Diễn giải tạm ứng
            </label>
            {advancePaymentEditable ? (
              <Input
                id="purchase-order-advance-payment-note"
                placeholder="Vd: Chuyển khoản đợt 1 ngày 10/10"
                maxLength={255}
                value={advancePaymentNote}
                onChange={(event) => setAdvancePaymentNote(event.target.value)}
                onBlur={() =>
                  submitAdvancePayment({
                    amount: advancePaymentAmount ?? 0,
                    note: advancePaymentNote,
                  })
                }
              />
            ) : (
              <p className="rounded-md bg-muted/40 px-3 py-2.5 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {purchaseOrder.advancePaymentNote ?? "Không có diễn giải."}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 lg:border-l lg:border-border/60 lg:pl-10">
        <dl className="flex flex-col gap-3.5">
          <CostRow
            icon={BillList}
            label="Thành tiền (chưa thuế)"
            amount={currencyFormatter.format(purchaseOrder.subtotal)}
          />
          <CostRow
            icon={Sale}
            label="Thuế VAT"
            amount={currencyFormatter.format(purchaseOrder.vatAmount)}
            control={
              editable ? (
                <SuffixedInput suffix="%">
                  <NumericFormat
                    customInput={Input}
                    className="pr-8 text-right tabular-nums"
                    placeholder="0"
                    value={vatPercent ?? ""}
                    decimalSeparator=","
                    thousandSeparator="."
                    decimalScale={2}
                    allowNegative={false}
                    isAllowed={({ floatValue }) =>
                      floatValue === undefined || floatValue <= 100
                    }
                    onValueChange={(values) => setVatPercent(values.floatValue)}
                    onBlur={() => {
                      const nextVatPercent = vatPercent ?? 0
                      if (nextVatPercent === purchaseOrder.vatPercent) return
                      save({ vatPercent: nextVatPercent })
                    }}
                  />
                </SuffixedInput>
              ) : (
                <span className="text-sm text-muted-foreground tabular-nums">
                  {currencyFormatter.format(purchaseOrder.vatPercent)}%
                </span>
              )
            }
          />
          <CostRow
            icon={Delivery}
            label="Chi phí khác"
            controlSpansAmount
            amount={
              editable
                ? undefined
                : currencyFormatter.format(purchaseOrder.otherCost)
            }
            control={
              editable ? (
                <SuffixedInput suffix="VNĐ">
                  <NumericFormat
                    customInput={Input}
                    className="pr-12 text-right tabular-nums"
                    placeholder="0"
                    value={otherCost ?? ""}
                    decimalSeparator=","
                    thousandSeparator="."
                    decimalScale={2}
                    allowNegative={false}
                    onValueChange={(values) => setOtherCost(values.floatValue)}
                    onBlur={() => {
                      const nextOtherCost = otherCost ?? 0
                      if (nextOtherCost === purchaseOrder.otherCost) return
                      save({ otherCost: nextOtherCost })
                    }}
                  />
                </SuffixedInput>
              ) : undefined
            }
          />
        </dl>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2.5 font-heading text-sm font-medium text-foreground">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <WalletMoney className="size-4" />
            </span>
            Tổng thanh toán
          </div>
          <div className="text-right">
            <span className="font-mono text-2xl font-semibold tracking-tight text-primary tabular-nums">
              {currencyFormatter.format(purchaseOrder.totalAmount)}
            </span>
            <span className="ml-1 text-xs font-medium text-primary">VNĐ</span>
          </div>
        </div>

        {showAdvancePayment && (
          <>
            <dl className="flex flex-col gap-3.5 border-t border-border/60 pt-4">
              <CostRow
                icon={HandMoney}
                label="Tạm ứng NCC"
                controlSpansAmount={advancePaymentEditable}
                amount={
                  advancePaymentEditable
                    ? undefined
                    : `− ${currencyFormatter.format(purchaseOrder.advancePaymentAmount)}`
                }
                control={
                  advancePaymentEditable ? (
                    <SuffixedInput suffix="VNĐ">
                      <NumericFormat
                        customInput={Input}
                        className="pr-12 text-right tabular-nums"
                        placeholder="0"
                        value={advancePaymentAmount ?? ""}
                        decimalSeparator=","
                        thousandSeparator="."
                        decimalScale={2}
                        allowNegative={false}
                        onValueChange={(values) =>
                          setAdvancePaymentAmount(values.floatValue)
                        }
                        onBlur={() =>
                          submitAdvancePayment({
                            amount: advancePaymentAmount ?? 0,
                            note: advancePaymentNote,
                          })
                        }
                      />
                    </SuffixedInput>
                  ) : undefined
                }
              />
            </dl>

            <div className="flex items-center justify-between gap-3 rounded-md bg-primary/5 px-3 py-3">
              <div className="font-heading text-sm font-medium text-foreground">
                Còn lại phải thanh toán
              </div>
              <div className="text-right">
                <span className="font-mono text-2xl font-semibold tracking-tight text-primary tabular-nums">
                  {currencyFormatter.format(payableAmount)}
                </span>
                <span className="ml-1 text-xs font-medium text-primary">
                  VNĐ
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
