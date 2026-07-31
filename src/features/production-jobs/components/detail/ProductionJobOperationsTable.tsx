import { Fragment } from "react"
import { DateTime } from "luxon"
import { ChevronDown, Package } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  OutsourceStepStatusBadge,
  ProductionStepStatusBadge,
} from "@/features/production-jobs/components/detail/ProductionJobStepBadges"
import {
  resolveOutsourceStepStatus,
  resolveProductionStepStatus,
} from "@/lib/types/production-job.type"
import type {
  ProductionJobMockOutsourceRow,
  ProductionJobMockPart,
} from "@/lib/types/production-job.type"
import { cn } from "@/lib/utils"

type ProductionJobOperationsTableProps = {
  parts: ProductionJobMockPart[]
  outsourceRows: ProductionJobMockOutsourceRow[]
}

type MergedOperation =
  | {
      kind: "inhouse"
      id: string
      operationName: string
      plannedQty: number
      doneQty: number
      completedAt: string | null
      note: string | null
    }
  | {
      kind: "outsource"
      id: string
      operationName: string
      plannedQty: number
      sentQty: number
      receivedQty: number
      note: string | null
    }

type PartGroup = {
  partCode: string
  partName: string
  operations: MergedOperation[]
}

// Gộp inhouseParts + outsourceRows theo Part (mã Part là khoá gộp) — một Part có thể vừa có
// bước trong xưởng vừa có công đoạn gia công ngoài (vd KM-CNC-01: Hàn/Mài/Lắp ráp + Sơn tĩnh
// điện), nên xem hết công đoạn của một Part cùng chỗ dễ quản lý hơn là tách theo loại. Dùng
// Map để giữ thứ tự xuất hiện: Part nào có bước trong xưởng lên trước, Part chỉ có gia công
// ngoài (TN-01, TD-01) nối vào sau.
function buildPartGroups(
  parts: ProductionJobMockPart[],
  outsourceRows: ProductionJobMockOutsourceRow[]
): PartGroup[] {
  const groups = new Map<string, PartGroup>()

  function getGroup(partCode: string, partName: string): PartGroup {
    const existing = groups.get(partCode)
    if (existing) return existing
    const created: PartGroup = { partCode, partName, operations: [] }
    groups.set(partCode, created)
    return created
  }

  parts.forEach((part) => {
    const group = getGroup(part.code, part.name)
    group.operations.push(
      ...part.steps.map(
        (step): MergedOperation => ({
          kind: "inhouse",
          id: step.id,
          operationName: step.name,
          plannedQty: step.plannedQty,
          doneQty: step.doneQty,
          completedAt: step.completedAt,
          note: step.note,
        })
      )
    )
  })

  outsourceRows.forEach((row) => {
    const group = getGroup(row.partCode, row.partName)
    group.operations.push({
      kind: "outsource",
      id: row.id,
      operationName: row.operationName,
      plannedQty: row.plannedQty,
      sentQty: row.sentQty,
      receivedQty: row.receivedQty,
      note: row.note,
    })
  })

  return Array.from(groups.values())
}

function RowKindBadge({ kind }: { kind: MergedOperation["kind"] }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "whitespace-nowrap",
        kind === "inhouse"
          ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
          : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          kind === "inhouse"
            ? "bg-blue-500 dark:bg-blue-400"
            : "bg-amber-500 dark:bg-amber-400"
        )}
      />
      {kind === "inhouse" ? "Trong xưởng" : "Gia công ngoài"}
    </Badge>
  )
}

// Bảng công đoạn sản xuất — Part là cha, mỗi công đoạn (trong xưởng lẫn gia công ngoài) là dòng
// con "1.1", "1.2"…, phân biệt bằng cột "Loại" thay vì 2 bảng riêng như mockup gốc. SL HOÀN
// THÀNH (trong xưởng) vẫn là ô nhập (đúng mockup — "Nhấn vào số lượng để cập nhật"); ĐÃ NHẬN
// (gia công ngoài) chỉ đọc, kèm ĐÃ GỬI hiện dưới dạng dòng phụ nhỏ cạnh badge trạng thái. Cả 2
// loại dùng chung ProductionJobProgressBar (đã dùng ở tab BOM vật tư) cho nhất quán hình ảnh
// toàn trang.
export function ProductionJobOperationsTable({
  parts,
  outsourceRows,
}: ProductionJobOperationsTableProps) {
  const groups = buildPartGroups(parts, outsourceRows)

  return (
    <Table>
      <TableHeader>
        <TableRow className="h-11 bg-muted/30 font-semibold text-muted-foreground hover:bg-muted/30">
          <TableHead className="w-16 font-bold text-foreground">STT</TableHead>
          <TableHead className="w-32 font-bold text-foreground">Loại</TableHead>
          <TableHead className="min-w-56 font-bold text-foreground">
            PART (MÃ - TÊN PART)
          </TableHead>
          <TableHead className="min-w-32 font-bold text-foreground">
            CÔNG ĐOẠN
          </TableHead>
          <TableHead className="w-28 text-center font-bold text-foreground">
            SL KẾ HOẠCH
          </TableHead>
          <TableHead className="w-32 text-center font-bold text-foreground">
            Tiến độ
          </TableHead>
          <TableHead className="w-36 text-center font-bold text-foreground">
            TRẠNG THÁI
          </TableHead>
          <TableHead className="min-w-32 font-bold text-foreground">
            Ghi chú
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group, groupIndex) => (
          <Fragment key={group.partCode}>
            <TableRow className="h-14 bg-muted/10 hover:bg-muted/15">
              <TableCell>
                <div className="flex items-center gap-2">
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border text-[11px] font-bold text-foreground">
                    {groupIndex + 1}
                  </span>
                </div>
              </TableCell>
              <TableCell colSpan={7}>
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground">
                    <Package className="size-4" />
                  </div>
                  <span className="font-mono font-semibold text-foreground">
                    {group.partCode}
                  </span>
                  <span className="text-muted-foreground">-</span>
                  <span className="font-semibold text-foreground">
                    {group.partName}
                  </span>
                </div>
              </TableCell>
            </TableRow>

            {group.operations.map((operation, operationIndex) => {
              return (
                <TableRow
                  key={operation.id}
                  className="bg-card hover:bg-muted/20"
                >
                  <TableCell className="py-3 pl-8 font-mono text-muted-foreground">
                    {groupIndex + 1}.{operationIndex + 1}
                  </TableCell>
                  <TableCell className="py-3">
                    <RowKindBadge kind={operation.kind} />
                  </TableCell>
                  <TableCell className="py-3" />
                  <TableCell className="py-3 font-medium text-foreground">
                    {operation.operationName}
                  </TableCell>
                  <TableCell className="py-3 text-center text-foreground tabular-nums">
                    {operation.plannedQty}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col items-center gap-1">
                      {operation.kind === "inhouse" ? (
                        <Input
                          defaultValue={operation.doneQty}
                          readOnly
                          className="mx-auto h-8 w-16 text-center tabular-nums"
                          aria-label={`SL hoàn thành — ${group.partCode} ${operation.operationName}`}
                        />
                      ) : (
                        <span className="block text-center text-sm font-semibold text-foreground tabular-nums">
                          {operation.receivedQty}
                        </span>
                      )}
                      {operation.kind === "inhouse" && operation.completedAt ? (
                        <span className="text-[10px] text-muted-foreground">
                          {DateTime.fromISO(operation.completedAt).toFormat(
                            "dd/MM/yyyy"
                          )}
                        </span>
                      ) : null}
                      {operation.kind === "outsource" ? (
                        <span className="text-[10px] text-muted-foreground">
                          Đã gửi: {operation.sentQty}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    {operation.kind === "inhouse" ? (
                      <ProductionStepStatusBadge
                        status={resolveProductionStepStatus(
                          operation.plannedQty,
                          operation.doneQty
                        )}
                      />
                    ) : (
                      <OutsourceStepStatusBadge
                        status={resolveOutsourceStepStatus(
                          operation.plannedQty,
                          operation.sentQty,
                          operation.receivedQty
                        )}
                      />
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-muted-foreground">
                    {operation.note ?? "—"}
                  </TableCell>
                </TableRow>
              )
            })}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  )
}
