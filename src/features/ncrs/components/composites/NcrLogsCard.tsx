import { format, parseISO } from "date-fns"

import { NcrSectionCard } from "@/features/ncrs/components/layouts/NcrSectionCard"
import { vnZone } from "@/lib/time"
import type { NcrLog } from "@/lib/types/ncr.type"

type NcrLogsCardProps = {
  logs: NcrLog[]
}

export function NcrLogsCard({ logs }: NcrLogsCardProps) {
  return (
    <NcrSectionCard title="Nhật ký">
      {logs.length === 0 ? (
        <p className="text-xs text-muted-foreground">Chưa có thao tác nào.</p>
      ) : (
        <ol className="space-y-3">
          {logs.map((log) => (
            <li key={log.id} className="space-y-0.5 text-xs">
              <p className="font-medium text-foreground">{log.content}</p>
              <p className="text-muted-foreground">
                {log.performerBy?.fullName ?? "Hệ thống"} ·{" "}
                {format(
                  parseISO(log.createdAt, { in: vnZone }),
                  "dd/MM/yyyy HH:mm"
                )}
              </p>
            </li>
          ))}
        </ol>
      )}
    </NcrSectionCard>
  )
}
