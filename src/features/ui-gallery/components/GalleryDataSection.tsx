import { useState } from "react"
import { Inbox } from "lucide-react"

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  GalleryRow,
  GallerySection,
} from "@/features/ui-gallery/components/GallerySection"

const sampleRows = [
  { code: "NCR-2026-00001", product: "CU GASKET 20X9X3T", qty: 10 },
  { code: "NCR-2026-00002", product: "RHC PREFORMER 1HOLE", qty: 4 },
  { code: "NCR-2026-00003", product: "DT ACCUM ROLLER ASS'Y", qty: 25 },
]

export function GalleryDataSection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  return (
    <GallerySection
      id="data"
      title="Hiển thị dữ liệu"
      description="Card, Table, Tabs, Avatar, Empty, Breadcrumb, Separator, Calendar"
    >
      <GalleryRow label="Card">
        <Card className="w-72">
          <CardHeader>
            <CardTitle>Tiêu đề thẻ</CardTitle>
            <CardDescription>Mô tả ngắn của thẻ.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">Nội dung thẻ.</CardContent>
        </Card>
      </GalleryRow>

      <GalleryRow label="Table">
        <div className="w-full overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-right">SL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleRows.map((sampleRow) => (
                <TableRow key={sampleRow.code}>
                  <TableCell className="font-mono">{sampleRow.code}</TableCell>
                  <TableCell>{sampleRow.product}</TableCell>
                  <TableCell className="text-right">{sampleRow.qty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GalleryRow>

      <GalleryRow label="Tabs">
        <Tabs defaultValue="info" className="w-full max-w-md">
          <TabsList>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="history">Lịch sử</TabsTrigger>
            <TabsTrigger value="files" disabled>
              Tệp
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="text-sm">
            Nội dung tab thông tin.
          </TabsContent>
          <TabsContent value="history" className="text-sm">
            Nội dung tab lịch sử.
          </TabsContent>
        </Tabs>
      </GalleryRow>

      <GalleryRow label="Avatar · Breadcrumb · Separator">
        <Avatar>
          <AvatarFallback>QT</AvatarFallback>
        </Avatar>
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>C</AvatarFallback>
          </Avatar>
        </AvatarGroup>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink to="/manage">Bảng điều khiển</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>NCR</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Separator orientation="vertical" className="h-6" />
        <Separator className="w-32" />
      </GalleryRow>

      <GalleryRow label="Empty">
        <Empty className="w-full max-w-md border border-dashed border-border">
          <EmptyHeader>
            <EmptyMedia>
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>Chưa có dữ liệu</EmptyTitle>
            <EmptyDescription>
              Dữ liệu sẽ xuất hiện ở đây khi được tạo.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </GalleryRow>

      <GalleryRow label="Calendar">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-lg border border-border"
        />
      </GalleryRow>
    </GallerySection>
  )
}
