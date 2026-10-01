import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { AlertTriangle, GripVertical, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DatePicker } from "@/components/shared/composites/DatePicker"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import type { OperationScheduleRow } from "@/features/production-jobs/hooks/use-operation-schedule"
import { findSequenceConflicts } from "@/features/production-jobs/utils/plan-schedule"
import { cn } from "@/lib/utils"

type OperationScheduleTableProps = {
  schedule: OperationScheduleRow[]
  onLeadtimeChange: (index: number, val: number) => void
  onDueDateChange: (index: number, dateStr: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onApplySuggestedSequence: () => void
}

type SortableScheduleRowProps = {
  row: OperationScheduleRow
  index: number
  hasConflict: boolean
  onLeadtimeChange: (index: number, val: number) => void
  onDueDateChange: (index: number, dateStr: string) => void
}

function SortableScheduleRow({
  row,
  index,
  hasConflict,
  onLeadtimeChange,
  onDueDateChange,
}: SortableScheduleRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.key })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: "relative", zIndex: 30 } : {}),
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        "h-14 bg-card transition-colors hover:bg-muted/20",
        isDragging && "bg-accent/30 opacity-75 shadow-md ring-1 ring-primary/40"
      )}
    >
      <TableCell className="text-center font-mono text-xs text-muted-foreground tabular-nums">
        {index + 1}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className={cn(
              "size-7 touch-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing",
              isDragging ? "cursor-grabbing text-primary" : "cursor-grab"
            )}
            title="Kéo thả để sắp xếp thứ tự"
            aria-label={`Kéo thả để đổi thứ tự công đoạn ${row.name}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-foreground sm:text-sm">
            {row.name}
          </span>
          {row.code ? (
            <span className="font-mono text-[11px] text-muted-foreground">
              ({row.code})
            </span>
          ) : null}
          {hasConflict && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <AlertTriangle
                    className="size-4 shrink-0 text-warning"
                    aria-label="Sai thứ tự"
                  />
                }
              />
              <TooltipContent>
                Đang đứng trước công đoạn của chi tiết cấp sâu hơn
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex justify-center">
          <NumericCellInput
            value={row.leadtime}
            min={1}
            onValueChange={(val) => {
              if (val !== undefined && val >= 1) {
                onLeadtimeChange(index, val)
              }
            }}
            className="h-8 w-18 text-center text-xs font-medium tabular-nums"
          />
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex justify-center">
          <div className="w-34">
            <DatePicker
              value={row.dueDate}
              onChange={(newDate) => onDueDateChange(index, newDate)}
            />
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}

// Operations run in chain (each due date starts from the previous one), so the row order IS the
// production order. Rows can be dragged and dropped to reorder; a row that sits before an operation
// of a deeper BOM level (e.g. packaging before painting) is flagged, and "Sắp xếp theo gợi ý" restores
// the level-based order.
export function OperationScheduleTable({
  schedule,
  onLeadtimeChange,
  onDueDateChange,
  onReorder,
  onApplySuggestedSequence,
}: OperationScheduleTableProps) {
  const conflicts = findSequenceConflicts(schedule)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = schedule.findIndex((item) => item.key === active.id)
    const newIndex = schedule.findIndex((item) => item.key === over.id)

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      onReorder(oldIndex, newIndex)
    }
  }

  return (
    <div className="space-y-2">
      {conflicts.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-warning/10 px-3 py-2 text-xs">
          <p className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="size-4 shrink-0 text-warning" />
            Có công đoạn đang xếp trước công đoạn của chi tiết cấp sâu hơn (vd.
            đóng gói trước sơn). Hãy chỉnh lại thứ tự.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={onApplySuggestedSequence}
          >
            <RotateCcw className="size-3.5" />
            Sắp xếp theo gợi ý
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-border/60">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <Table aria-label="Kế hoạch công đoạn" className="min-w-[500px]">
            <TableHeader className="[&>tr]:h-11 [&>tr]:bg-muted/30 [&>tr]:font-semibold [&>tr]:text-muted-foreground [&>tr]:hover:bg-muted/30">
              <TableRow>
                <TableHead className="w-10 min-w-10 text-center font-bold text-foreground">
                  STT
                </TableHead>
                <TableHead
                  className="w-10 min-w-10 text-center font-bold text-foreground"
                  title="Kéo thả đổi thứ tự"
                >
                  <GripVertical className="mx-auto size-3.5 opacity-50" />
                  <span className="sr-only">Kéo thả thứ tự</span>
                </TableHead>
                <TableHead className="min-w-36 font-bold text-foreground">
                  CÔNG ĐOẠN
                </TableHead>
                <TableHead className="w-28 min-w-28 text-center font-bold text-foreground">
                  LEADTIME (NGÀY)
                </TableHead>
                <TableHead className="w-38 min-w-38 text-center font-bold text-foreground">
                  HẠN HOÀN THÀNH
                </TableHead>
              </TableRow>
            </TableHeader>
            <SortableContext
              items={schedule.map((row) => row.key)}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {schedule.map((row, index) => (
                  <SortableScheduleRow
                    key={row.key}
                    row={row}
                    index={index}
                    hasConflict={conflicts.has(index)}
                    onLeadtimeChange={onLeadtimeChange}
                    onDueDateChange={onDueDateChange}
                  />
                ))}
              </TableBody>
            </SortableContext>
          </Table>
        </DndContext>
      </div>
    </div>
  )
}
