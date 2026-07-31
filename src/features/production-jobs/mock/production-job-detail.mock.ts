import { ProductionJobStatus } from "@/lib/types/production-job.type"
import type { ProductionJobMockDetail } from "@/lib/types/production-job.type"

// Hardcoded, not faker-seeded (unlike order-detail.mock.ts) — this backs the Job detail screen's
// static-UI-first build (task 8.2 has no API yet), so it's kept matching the approved mockup 1:1
// rather than varying per id. Every Job routed to from the list currently renders this same
// payload; delete once GET /production-jobs/:jobId ships (see production-job.type.ts).
export const PRODUCTION_JOB_MOCK_DETAIL: ProductionJobMockDetail = {
  code: "26-0001-001",
  lsxCode: "26-0001",
  productName: "Khung máy CNC 2026",
  clientName: "Công ty ABC",
  quantity: 20,
  producedQty: 0,
  poNumber: "PO240501",
  createdAt: "2026-05-02",
  dueDate: "2026-05-25",
  status: ProductionJobStatus.IN_PROGRESS,
  inhouseParts: [
    {
      code: "KM-01",
      name: "Thanh dưới",
      steps: [
        {
          id: "km-01-cat-laser",
          name: "Cắt laser",
          plannedQty: 40,
          doneQty: 40,
          completedAt: "2026-06-15",
          note: null,
        },
        {
          id: "km-01-chan",
          name: "Chấn",
          plannedQty: 40,
          doneQty: 20,
          completedAt: null,
          note: null,
        },
      ],
    },
    {
      code: "KM-02",
      name: "Thanh trên",
      steps: [
        {
          id: "km-02-cat-laser",
          name: "Cắt laser",
          plannedQty: 40,
          doneQty: 40,
          completedAt: "2026-06-15",
          note: null,
        },
        {
          id: "km-02-chan",
          name: "Chấn",
          plannedQty: 40,
          doneQty: 10,
          completedAt: null,
          note: null,
        },
      ],
    },
    {
      code: "KM-CNC-01",
      name: "Khung máy chính",
      steps: [
        {
          id: "km-cnc-01-han",
          name: "Hàn",
          plannedQty: 20,
          doneQty: 10,
          completedAt: null,
          note: null,
        },
        {
          id: "km-cnc-01-mai",
          name: "Mài",
          plannedQty: 20,
          doneQty: 0,
          completedAt: null,
          note: null,
        },
        {
          id: "km-cnc-01-lap-rap",
          name: "Lắp ráp",
          plannedQty: 20,
          doneQty: 0,
          completedAt: null,
          note: null,
        },
      ],
    },
  ],
  outsourceRows: [
    {
      id: "km-cnc-01-son-tinh-dien",
      partCode: "KM-CNC-01",
      partName: "Khung máy chính",
      operationName: "Sơn tĩnh điện",
      plannedQty: 20,
      sentQty: 15,
      receivedQty: 8,
      note: null,
    },
    {
      id: "tn-01-xi-ma-kem",
      partCode: "TN-01",
      partName: "Tấm nắp",
      operationName: "Xi mạ kẽm",
      plannedQty: 20,
      sentQty: 20,
      receivedQty: 20,
      note: null,
    },
    {
      id: "td-01-nhiet-luyen",
      partCode: "TD-01",
      partName: "Tay đỡ",
      operationName: "Nhiệt luyện",
      plannedQty: 20,
      sentQty: 0,
      receivedQty: 0,
      note: null,
    },
  ],
  materials: [
    {
      id: "thep-hop-40x40",
      code: "VT-0012",
      name: "Thép hộp 40x40",
      unitName: "Mét",
      normQty: 1.2,
      requiredQty: 24,
      issuedQty: 24,
    },
    {
      id: "thep-tam-3ly",
      code: "VT-0031",
      name: "Thép tấm 3ly",
      unitName: "Tấm",
      normQty: 0.5,
      requiredQty: 10,
      issuedQty: 6,
    },
    {
      id: "bulong-m8",
      code: "VT-0088",
      name: "Bu lông M8",
      unitName: "Con",
      normQty: 8,
      requiredQty: 160,
      issuedQty: 0,
    },
  ],
  documents: [
    {
      id: "ban-ve-lap-rap",
      name: "Bản vẽ lắp ráp KM-CNC-01.pdf",
      sizeLabel: "2.4 MB",
      uploadedAt: "2026-05-03",
    },
    {
      id: "yeu-cau-ky-thuat",
      name: "Yêu cầu kỹ thuật.docx",
      sizeLabel: "340 KB",
      uploadedAt: "2026-05-03",
    },
  ],
  notes: [
    {
      id: "note-1",
      authorName: "Nguyễn Văn A",
      createdAt: "2026-05-03T10:15:00+07:00",
      content: "Khách yêu cầu sơn màu ghi (RAL 7016).",
    },
    {
      id: "note-2",
      authorName: "Trần Thị B",
      createdAt: "2026-06-14T08:40:00+07:00",
      content: "Ưu tiên hoàn thành khung chính trước 20/06.",
    },
  ],
  logs: [
    {
      id: "log-1",
      performedAt: "2026-05-02T08:15:00+07:00",
      actorName: "Nguyễn Văn A",
      action: "Tạo Job",
      content: "Tạo Job từ LSX 26-0001",
    },
    {
      id: "log-2",
      performedAt: "2026-06-14T09:30:00+07:00",
      actorName: "Trần Thị B",
      action: "Cập nhật số lượng",
      content: "Cắt laser KM-01: hoàn thành 40/40",
    },
    {
      id: "log-3",
      performedAt: "2026-06-20T14:05:00+07:00",
      actorName: "Trần Thị B",
      action: "Gửi gia công ngoài",
      content: "Gửi 15/20 KM-CNC-01 đi Sơn tĩnh điện",
    },
  ],
}
