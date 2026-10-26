<!-- Generated: 2026-10-26 | Files scanned: ~77 (BE codemaps x7, ui-flow, FE input JSON x5, BE services/controllers, FE action components) | Token estimate: ~8500 -->
# System flow codemap (cross-stack)

Trace one business chain UI -> FE server fn -> BE endpoint -> service -> tables -> status. Per-domain detail: FE `docs/CODEMAPS/{sales,purchasing,inventory,production,quality}.md`, BE `be-quanlysanxuat/docs/CODEMAPS/{sales,purchasing,inventory,production,quality}.md`, screens `docs/ui-flow.md`.

Conventions: FE fn = `<feature>/<file>` under `src/features/<feature>/api/server-functions/`. BE = `ctrl:L -> svc:L` in `be-quanlysanxuat/src/api/<domain>/<domain>.{controller,service}.ts` (lines checked against HEAD 4c21c9c; handler name only when it differs from the FE fn). Perm = permission string checked by the controller. "X-DOMAIN" marks a service calling another domain's service or writing its tables. Labels are the verbatim button text found in `src/features/**`. Table prefixes dropped where obvious: `inv_` = `inventory_`.

## 0. Cross-domain call index (the glue)

| From | To | Where |
|---|---|---|
| OrdersService.approveOrder | ProductionOrdersService.getInitialPlanItems / seedPlan (writes production_orders, _items, _logs) | `orders.service.ts:738/750` |
| ProductionOrdersService.approveProductionOrder | writes `orders.status` = IN_PROGRESS (:503); ProductionJobsService.createJobs (:506) | `production-orders.service.ts` |
| ProductionJobsService.startJob | PurchaseRequestsService.createShortageRequest (writes purchase_requests) | `production-jobs.service.ts:860` |
| ProductionJobsController.requestJobQc | OqcService.createOqcForJob | `production-jobs.controller.ts:320` |
| OqcService.confirmOqc | createProductionReceiptForJob (:627, `inventory-receipts.write.ts:82`), closeJobIfQcCovered (:636), closeNcrAfterOqc (:644), createNcrFromOqc (:653, `ncrs.write.ts:32`) | `oqc.service.ts` |
| InventoryReceiptsService.confirm / cancel / post | IqcService.createInspectionsFromReceipt (:606); cancelReceiptInspections (:876, `iqc.write.ts:99`); PaymentRequestsService.createIfOrderCompleted (:691) + closeJobIfFullyReceived (:701) -> closeNcrIfProductionOrdersDone (:808) | `inventory-receipts.service.ts` |
| OutsourcingReceiptsService.create | IqcService.createInspectionsFromOutsourcingReceipt (:404), recomputeOutsourcingOrderStatus (:427), recomputeOutsourcedOperationProgress (:437) | `outsourcing-receipts.service.ts` |
| IqcService.confirmIqc | SupplierReturnsService.createFromIqcDisposition (:840), closeJobIfQcCovered (:798), recomputeOutsourcingOrderStatus (:879) | `iqc.service.ts` |
| SupplierReturnsService.postSupplierReturn | InventoryPostingService.postDocument (:356), completeIqcAfterSupplierReturn (:399), recompute OS-OUT/op progress (:437/:448) | `supplier-returns.service.ts` |
| OutboundOrdersService.send / approve | ensureAllJobsQcCompleted (reads OQC coverage, send); approve inserts a DRAFT SALES `inventory_issues` (`createSalesIssueDraft`) | `outbound-orders.service.ts` |
| InventoryIssuesService.post (DO-linked issue) | postDocument + DO = DELIVERED + closeOrdersIfFullyDelivered (writes `orders`, `outbound-orders.query.ts`); cancel cancels the DO | `inventory-issues.service.ts` |
| PurchaseQuotationsService.approveQuotation | PurchaseOrdersService.createPendingOrdersFromQuotation (:652) | `purchase-quotations.service.ts` |
| PurchaseOrdersService.cancel / close / advance | PaymentRequestsService.cancelForOrder (:778), revertQuotationToDraft (:822); createIfOrderCompleted (:953, on close); applyAdvancePayment (:650) | `purchase-orders.service.ts` |
| NcrsService.createProductionOrder | ProductionJobsService.createJobs (:390) | `ncrs.service.ts` |

## 1. Sales: SO -> approval -> DO -> fulfilled

```
SO create (DRAFT) --"Gửi duyệt"--> PENDING_CONFIRMATION --"Duyệt"--> AWAITING_PRODUCTION  (+LSX PENDING seeded, X-DOMAIN)
        |                               \--"Từ chối"--> REJECTED --"Gửi duyệt"--> PENDING_CONFIRMATION
        v   (LSX approve, chain 2: SO -> IN_PROGRESS)
DO create (DRAFT) --"Gửi duyệt DO"--> PENDING_APPROVAL --"Duyệt"--> PENDING_DELIVERY "Chờ xuất kho" --warehouse "Xuất kho" on the DRAFT SALES issue--> DELIVERED
                                       \--"Từ chối"--> REJECTED           (stock out + SO IN_PROGRESS -> COMPLETED when fully delivered)
```

| # | UI route + button | FE server fn | METHOD /api/... | Perm | BE handler -> service | Tables written | Status | Blocking errors |
|---|---|---|---|---|---|---|---|---|
| 1.1 | `/manage/orders/create` form save | createOrder (`orders/create-order.api.ts`) | POST /orders | orders:create | ctrl:140 -> svc:580 | orders, order_items, order_files, document_sequences | -> DRAFT (client may send status) | E059 E060 E061 E275 E075 |
| 1.2 | `/manage/orders/$orderId` "Gửi duyệt" (DRAFT or REJECTED) | reqOrderApproval (`orders/req-order-approval.api.ts`, sends only `status`) | PATCH /orders/:orderId (handler updateOrder) | orders:update | ctrl:154 -> svc:646 | orders (items untouched) | DRAFT\|REJECTED -> PENDING_CONFIRMATION | E065 E090 E080 E057 |
| 1.3 | same page "Duyệt" | approveOrder (`orders/approve-order.api.ts`) | POST /orders/:orderId/approve | orders:approve | ctrl:168 -> svc:729 | orders; X-DOMAIN production_orders, production_order_items, production_order_logs (seedPlan `production-orders.service.ts:610`) | PENDING_CONFIRMATION -> AWAITING_PRODUCTION; LSX -> PENDING | E074 E080 E057 |
| 1.4 | same page "Từ chối" | rejectOrder (`orders/reject-order.api.ts`) | POST /orders/:orderId/reject | orders:approve | ctrl:182 -> svc:760 | orders | PENDING_CONFIRMATION -> REJECTED | E074 |
| 1.5 | `/manage/outbound-orders/create` wizard ③ "Xác nhận & tạo phiếu" (picker = GET /outbound-orders/unfulfilled-order-items) | createOutboundOrder (`outbound-orders/create-outbound-order.api.ts`) | POST /outbound-orders | outbound:create | ctrl:129 -> svc:491 | outbound_orders, outbound_order_items, document_sequences | -> DRAFT (holds FG, `ensureOutboundLinesIssuable`) | E009 E194 |
| 1.6 | `/manage/outbound-orders/$outboundOrderId` "Sửa" (`?mode=edit`) | updateOutboundOrder | PATCH /outbound-orders/:id | outbound:update | ctrl:145 -> svc:516 | outbound_orders, outbound_order_items | DRAFT only | E259 E194 |
| 1.7 | same page "Gửi duyệt DO" | sendOutboundOrder (`send-outbound-order.api.ts`) | POST .../:id/send | outbound:update | ctrl:162 -> svc:637 | outbound_orders; X-DOMAIN reads OQC coverage (`ensureAllJobsQcCompleted`) | DRAFT\|REJECTED -> PENDING_APPROVAL | E239 E205 E194 |
| 1.8 | same page "Duyệt" / "Từ chối" | approveOutboundOrder / rejectOutboundOrder | POST .../:id/approve, /reject | outbound:approve | ctrl:179 -> svc:672; ctrl:195 -> svc:755 | outbound_orders, inv_issues + inv_issue_items (approve: DRAFT SALES issue, PXK-) | PENDING_APPROVAL -> PENDING_DELIVERY / REJECTED | E240 E194 (approve) |
| 1.9 | issue detail "Xuất kho" (menu "Xuất kho thành phẩm"; DO detail links to it) | postInventoryIssue | POST /inventory-issues/:id/post | inventory:update | InventoryIssuesService.postInventoryIssue (:378) | inv_issues (POSTED), inv_transactions, inv_balances, outbound_orders; X-DOMAIN orders (`closeOrdersIfFullyDelivered`) | issue DRAFT -> POSTED, DO PENDING_DELIVERY -> DELIVERED; SO IN_PROGRESS -> COMPLETED if every NORMAL line delivered | E237 E098 E106 |
| 1.10 | same page "Hủy đơn DO" | cancelOutboundOrder | POST .../:id/cancel | outbound:update | ctrl:233 -> svc:547 | outbound_orders, inv_issues (DRAFT -> CANCELLED) | DRAFT\|PENDING_APPROVAL\|PENDING_DELIVERY -> CANCELLED (releases hold) | E257 |
| 1.11 | DO detail "Cập nhật hóa đơn" (card + dialog, DELIVERED only; list tile "DO chưa xuất hóa đơn" = GET /outbound-orders/stats) | updateOutboundOrderInvoice (`outbound-orders/update-outbound-order-invoice.api.ts`) | PATCH .../:id/invoice | outbound:invoice | ctrl:214 -> svc:819 | outbound_orders (invoice_status ISSUED, invoice_no, invoice_date, invoiced_by/at) | DELIVERED only; re-save overwrites | E320 |

Notes: BE has no submit route; 1.2 is a plain PATCH. SO only closes from IN_PROGRESS (`outbound-orders.query.ts:168+`), so a DO delivered while SO is AWAITING_PRODUCTION does not complete it. Source: BE sales.md section 3.

## 2. Production: SO -> LSX -> JOB -> reports -> OQC -> FG receipt

```
SO AWAITING_PRODUCTION --(auto)--> LSX PENDING --"Duyệt LSX"--> LSX APPROVED + JOBs PENDING (snapshot BOM/ops/issues); SO -> IN_PROGRESS
JOB PENDING --"Xác nhận kế hoạch"+"Xác nhận"--> IN_PROGRESS (+shortage PR) --"Nhập báo cáo"/"Lưu báo cáo"--> (auto) WAITING_QC
JOB --"Yêu cầu OQC"--> OQC DRAFT --"Lưu" (PASS)--> OQC COMPLETED --(auto)--> JOB WAITING_DELIVERY + FG receipt PENDING_RECEIPT
FG receipt --"Xác nhận nhập kho"--> POSTED --(auto)--> JOB COMPLETED --(all JOBs)--> LSX COMPLETED
```

| # | UI route + button | FE server fn | METHOD /api/... | Perm | BE handler -> service | Tables written | Status | Blocking errors |
|---|---|---|---|---|---|---|---|---|
| 2.1 | `/manage/production-orders/$productionOrderId` "Lưu thay đổi" | updateProductionOrder (`production-orders/update-production-order.api.ts`) | PATCH /production-orders/:id | production:update | ctrl:100 -> svc:335 | production_order_items, production_order_logs | PENDING (qty edit) | E084 E078 E081 E057 |
| 2.2 | same page "Duyệt LSX" (PENDING only) | approveProductionOrder (`.../approve-production-order.api.ts`) | POST /production-orders/:id/approve | production:approve | ctrl:171 -> svc:434 | production_orders, production_order_logs, X-DOMAIN orders.status, production_jobs + job bom_items/operations/issues + job_logs via createJobs (:506 -> `production-jobs.service.ts:705`) | LSX PENDING -> APPROVED (or COMPLETED if 100% from stock); SO AWAITING_PRODUCTION -> IN_PROGRESS; JOB -> PENDING | E083 E076 E057 E081 |
| 2.3 | `/manage/production-jobs/$productionJobId` tab BOM: "Tải lại" / edit lines | reloadProductionJobSnapshot; createProductionJobIssues / updateProductionJobIssue / deleteProductionJobIssue (`production-jobs/*.api.ts`) | POST .../snapshot; POST/PATCH/DELETE .../bom[/:issueId] | production:update | ctrl:239 -> svc:749; ctrl:186/200/220 -> svc:771/782/794 | job bom_items/operations/issues, job_logs | JOB PENDING only | E087 E281 E282 E283 E007 |
| 2.4 | same page header "Xác nhận kế hoạch" then dialog "Xác nhận" | startProductionJob (`production-jobs/start-production-job.api.ts`) | POST /production-jobs/:jobId/start | production:update | ctrl:250 -> svc:819 | production_jobs, job_logs; X-DOMAIN purchase_requests(+items) via createShortageRequest (:860) | JOB PENDING -> IN_PROGRESS; shortage PR DRAFT | E087 |
| 2.5 | JOB tab "Công đoạn sản xuất" or `/manage/production-execution/$productionJobId`: "Nhập báo cáo" -> "Lưu báo cáo" | createJobOperationReport (`production-jobs/create-job-operation-report.api.ts`) | POST /production-execution/operations/:jobOperationId/reports | production-execution:report | ctrl:125 -> svc:479 | production_job_operation_reports(+files), production_job_operations, production_jobs + job_logs via closeJobIfFinalAssemblyDone (:595) | JOB IN_PROGRESS -> WAITING_QC (auto when no FG op pending) | E091 E260 E087 E256 E210 E279 |
| 2.6 | JOB header "Yêu cầu OQC" (disabled unless IN_PROGRESS/WAITING_QC and `oqcRequestableQuantity` > 0) | requestProductionJobQc (`production-jobs/request-production-job-qc.api.ts`) | POST /production-jobs/:jobId/qc | oqc:create | ctrl:315 requestJobQc -> X-DOMAIN OqcService.createOqcForJob `oqc.service.ts:470` | quality_inspections, document_sequences | OQC -> DRAFT | E082 E175 E213 E199 E198 E176 |
| 2.7 | `/manage/oqc/$oqcId` "Lưu" (single form submit, no "Xác nhận kết quả" button) | confirmOqc (`oqc/confirm-oqc.api.ts`) | POST /oqc/:oqcId/confirm | oqc:update | ctrl:74 -> svc:545 | quality_inspection_results, quality_inspections, evidences, files; X-DOMAIN inv_receipts(+items) (PRODUCTION, PENDING_RECEIPT), production_jobs(+logs), ncrs(+logs) | PASS or FAIL+ACCEPT/SORT/SCRAP -> COMPLETED; FAIL no disposition -> PENDING; JOB -> WAITING_DELIVERY when coverage closed (`oqc.query.ts:269`) | E177 E174 E160 E161 E162 |
| 2.8 | `/manage/inventory-receipts/$inventoryReceiptId` "Xác nhận nhập kho" | postInventoryReceipt (`inventory-receipts/post-inventory-receipt.api.ts`) | POST /inventory-receipts/:receiptId/post | inventory:update | ctrl:131 -> svc:642 | inv_receipts, inv_balances, inv_transactions (PRODUCTION_IN), X-DOMAIN production_jobs/orders(+logs), ncrs | receipt PENDING_RECEIPT -> POSTED; JOB WAITING_DELIVERY -> COMPLETED (received + NCR-transferred >= qty); LSX -> COMPLETED when all JOBs COMPLETED | E098 E153 E096 |

Receipt gates that block upstream steps: E196/E209/E197 (`ensureProductionReceiptOqcCleared`, `inventory-receipts.service.ts:1182`), E205 for DO send. The FG receipt has no create or confirm step (born PENDING_RECEIPT in 2.7). Source: BE production.md section 3, inventory.md "Production receipt and job closure".

## 3. Quality: IQC, OQC Fail/Sort, NCR, secondary LSX, re-OQC

```
IQC:  receipt "Xác nhận & Gửi IQC" -> IQC DRAFT --"Lưu" PASS/CONCESSION--> COMPLETED
                                          \--FAIL--> PENDING --"Lưu" + SORT|RETURN--> IN_PROGRESS "Chờ trả NCC" + supplier_return DRAFT
      supplier return "Xác nhận xuất" -> POSTED --(auto)--> IQC COMPLETED -> receipt IQC_COMPLETED
OQC:  FAIL + SORT (sortOkQty / sortNgQty) -> OQC COMPLETED, OK qty -> FG receipt; NG qty > 0 -> NCR-NB OPEN
NCR:  OPEN --"Gửi duyệt"--> PENDING_APPROVAL --"Duyệt"--> APPROVED --"Tạo LSX sửa chữa"/"Tạo LSX làm mới"--> IN_PROGRESS --(LSX COMPLETED)--> CLOSED
      APPROVED --"Không tạo LSX"--> PENDING_QC --"Yêu cầu OQC lại"--> re-OQC DRAFT --"Lưu"--> COMPLETED --(auto)--> NCR CLOSED
```

| # | UI route + button | FE server fn | METHOD /api/... | Perm | BE handler -> service | Tables written | Status | Blocking errors |
|---|---|---|---|---|---|---|---|---|
| 3.1 | `/manage/inventory-receipts/create-receipt` "Xác nhận & Gửi IQC" (createInventoryReceipt then confirm); detail "Xác nhận" for a DRAFT | confirmInventoryReceipt (`inventory-receipts/confirm-inventory-receipt.api.ts`) | POST /inventory-receipts/:receiptId/confirm | inventory:update | ctrl:114 -> svc:559 | inv_receipts; X-DOMAIN quality_inspections via createInspectionsFromReceipt (:606) | receipt DRAFT -> PENDING_IQC (requiresIqc) or PENDING_RECEIPT; IQC -> DRAFT | E151 E152 E145 E154 E293 E294 |
| 3.2 | (OS-IN, see 5.3) | createOutsourcingReceipt | POST /outsourcing-receipts | outsourcing:create | ctrl:89 -> svc:355 | quality_inspections via createInspectionsFromOutsourcingReceipt (`iqc.service.ts:458`) | IQC -> DRAFT, anchored to the OUTSOURCE operation | E185 E186 E187 |
| 3.3 | `/manage/iqc/$iqcId` "Lưu" (re-callable; locked at IN_PROGRESS) | confirmIqc (`iqc/confirm-iqc.api.ts`) | POST /iqc/:iqcId/confirm | iqc:update | ctrl:104 -> svc:673 | quality_inspection_results, quality_inspections, evidences, files; X-DOMAIN supplier_returns (DRAFT), inv_receipts (syncReceiptIqcStatus), production_jobs(+logs), outsourcing_orders | PASS/CONCESSION -> COMPLETED; FAIL -> PENDING; FAIL+SORT\|RETURN -> IN_PROGRESS | E159 E288 E254 E160 E161 E162 E138 |
| 3.4 | `/manage/supplier-returns/$supplierReturnId` "Xác nhận xuất" | postSupplierReturn (`supplier-returns/post-supplier-return.api.ts`) | POST /supplier-returns/:id/post | inventory:update | ctrl:82 -> svc:336 | supplier_returns(+files), inv_balances, inv_transactions (ISSUE, unless OS-IN origin); X-DOMAIN quality_inspections, outsourcing_orders, production_job_operations | return DRAFT -> POSTED; IQC IN_PROGRESS -> COMPLETED | E137 E164 E106 |
| 3.5 | OQC FAIL+SORT: same click as 2.7 | confirmOqc | POST /oqc/:oqcId/confirm | oqc:update | ctrl:74 -> svc:545 -> `createNcrFromOqc` (:653, `ncrs.write.ts:32`) | X-DOMAIN ncrs (INTERNAL, originType OQC, ngQty = sortNgQty, parentNcrId = OQC's ncrId), ncr_logs | NCR -> OPEN (only when sortNgQty > 0) | E160 E161 E162 |
| 3.6 | `/manage/ncrs/create` "Tạo NCR" (manual NB or KH) | createNcr (`ncrs/create-ncr.api.ts`) | POST /ncrs | ncr:create | ctrl:51 -> svc:145 | ncrs, ncr_logs, document_sequences | -> OPEN | E304 E302 |
| 3.7 | `/manage/ncrs/$ncrId` "Lưu phân tích" | updateNcr | PATCH /ncrs/:ncrId | ncr:update | ctrl:83 -> svc:178 | ncrs, ncr_logs | OPEN\|REJECTED stays (edit rework/remake qty) | E301 E303 |
| 3.8 | same "Gửi duyệt" | submitNcr | POST /ncrs/:ncrId/submit | ncr:update | ctrl:97 -> svc:217 | ncrs, ncr_logs | OPEN\|REJECTED -> PENDING_APPROVAL | E301 E309 E310 E302 |
| 3.9 | same "Duyệt" / "Không duyệt" | approveNcr / rejectNcr | POST .../approve, /reject | ncr:approve | ctrl:107 -> svc:252; ctrl:120 -> svc:270 | ncrs, ncr_logs | PENDING_APPROVAL -> APPROVED / REJECTED | E301 |
| 3.10 | same "Tạo LSX sửa chữa" (REWORK) / "Tạo LSX làm mới" (REMAKE) | createNcrProductionOrder (`ncrs/create-ncr-production-order.api.ts`) | POST /ncrs/:ncrId/production-order | ncr:update | ctrl:147 createProductionOrder -> svc:337 | X-DOMAIN production_orders (sourceType NCR, APPROVED, same orderId) + logs, production_jobs via createJobs (:390), ncrs, ncr_logs | NCR APPROVED\|IN_PROGRESS -> IN_PROGRESS; LSX born APPROVED, 1 JOB | E301 E305 E306 E307 |
| 3.11 | same "Không tạo LSX" | skipNcrProductionOrder | POST .../skip-production-order | ncr:update | ctrl:165 completeWithoutProductionOrder -> svc:313 | ncrs, ncr_logs | APPROVED -> PENDING_QC | E301 E307 |
| 3.12 | same "Yêu cầu OQC lại" (dialog "Tạo phiếu OQC"; shown at PENDING_QC with a job) | requestNcrOqc | POST .../oqc | ncr:update + oqc:create | ctrl:181 requestOqc -> svc:421 | X-DOMAIN quality_inspections (DRAFT, ncrId), ncrs, ncr_logs | NCR APPROVED\|PENDING_QC -> PENDING_QC | E311 E308 E213 |
| 3.13 | re-OQC `/manage/oqc/$oqcId` "Lưu" | confirmOqc | POST /oqc/:oqcId/confirm | oqc:update | ctrl:74 -> svc:545 -> closeNcrAfterOqc (:644, `ncrs.write.ts:120`) | ncrs, ncr_logs (+child NCR if SORT leaves NG) | NCR PENDING_QC -> CLOSED | E177 |
| 3.14 | automatic when secondary LSX completes (post FG receipt, 2.8) | postInventoryReceipt | POST .../post | inventory:update | svc:701 closeJobIfFullyReceived -> closeNcrIfProductionOrdersDone (:808, `ncrs.write.ts:143`) | ncrs, ncr_logs | NCR IN_PROGRESS -> CLOSED when COMPLETED LSX count >= (reworkQty>0)+(remakeQty>0) | - |
| 3.15 | same page "Đóng NCR" (APPROVED, processing qty 0) | closeNcr | POST .../close | ncr:update | ctrl:134 -> svc:295 | ncrs, ncr_logs | APPROVED -> CLOSED | E301 |

NCR-NB vs NCR-KH (same table `ncrs`, same state machine, FE labels `ncrTypeLabels`):

| | NCR-NB (`INTERNAL`, "NCR-NB (nội bộ)") | NCR-KH (`CUSTOMER`, "NCR-KH (khách hàng)") |
|---|---|---|
| Born by | auto from OQC SORT NG (`originType OQC`) or manual (3.6) | manual only (3.6) |
| Required at create | none | clientId E304, departmentId E302 |
| orderId (needed for secondary LSX, E305) | copied from the JOB's LSX | picked by the user |
| Re-OQC / LSX phụ | yes, same routes | yes, same routes (needs `productionJobId` for 3.12: E311) |

Not covered by FE: `POST /iqc`, `PATCH/DELETE /iqc/:id` (BE only, no server fn). OQC FAIL+REWORK is legacy IN_PROGRESS (no guard rejects it). Unverified: whether a secondary job's output must pass OQC before receipt; cumulative cap across repeated 3.12 requests. Source: BE quality.md sections 3-4.

## 4. Purchasing: PR -> RFQ -> DMH -> receipt (+IQC) -> payment

```
PR DRAFT --"Gửi duyệt"--> PENDING_APPROVAL --"Duyệt"--> APPROVED     (or startJob shortage PR, chain 2)
RFQ DRAFT --"Gửi duyệt"--> PENDING_APPROVAL --"Duyệt & tạo đơn mua"--> APPROVED + DMH per supplier PENDING_CONFIRMATION (X-DOMAIN)
DMH --"Xác nhận đặt hàng"--> ORDERED --receipt create-from-PO "Xác nhận & Gửi IQC"--> IQC (chain 3) --"Xác nhận nhập kho"--> POSTED
receipt POSTED + DMH fully received --(auto)--> YCTT DRAFT --"Đề nghị thanh toán"--> PENDING --"Xác nhận thanh toán"--> PAID
```

| # | UI route + button | FE server fn | METHOD /api/... | Perm | BE handler -> service | Tables written | Status | Blocking errors |
|---|---|---|---|---|---|---|---|---|
| 4.1 | `/manage/purchase-requests/create` "Tạo đề xuất" | createPurchaseRequest (`purchase-requests/create-purchase-request.api.ts`) | POST /purchase-requests | purchase-requests:create | ctrl:73 -> svc:687 | purchase_requests, purchase_request_items | -> DRAFT | E146 E147 E148 |
| 4.2 | `/manage/purchase-requests/$purchaseRequestId` "Gửi duyệt" | sendPurchaseRequest | POST .../:id/send | purchase-requests:update | ctrl:105 -> svc:537 | purchase_requests | DRAFT\|REJECTED -> PENDING_APPROVAL | E114 E112 |
| 4.3 | same "Duyệt" / reject | approvePurchaseRequest / rejectPurchaseRequest | POST .../approve, /reject | purchase-requests:approve | ctrl:121 -> svc:553; ctrl:138 -> svc:571 | purchase_requests | PENDING_APPROVAL -> APPROVED / REJECTED | E116 E112 |
| 4.4 | `/manage/purchase-quotations/create` "Tạo RFQ" | createPurchaseQuotation (`purchase-quotations/create-purchase-quotation.api.ts`) | POST /purchase-quotations | purchasing:create | ctrl:101 createQuotation -> svc:407 | purchase_quotations, _items, _item_allocations, _item_suppliers | -> DRAFT | E150 E128 E125 E149 E265 E129 E019 |
| 4.5 | `/manage/purchase-quotations/$purchaseQuotationId` "Gửi duyệt" | sendPurchaseQuotation | POST .../:id/send | purchasing:update | ctrl:142 -> svc:470 | purchase_quotations | DRAFT -> PENDING_APPROVAL | E118 E131 E130 E120 |
| 4.6 | same "Duyệt & tạo đơn mua" (needs comparison view, GET .../:id/comparison) | approvePurchaseQuotation | POST .../:id/approve | purchasing:approve | ctrl:159 approveQuotation -> svc:519 | item_suppliers.selected*, purchase_quotations; X-DOMAIN purchase_orders, purchase_order_items via createPendingOrdersFromQuotation (`purchase-orders.service.ts:548`) | RFQ PENDING_APPROVAL -> APPROVED; DMH -> PENDING_CONFIRMATION (one per supplier) | E118 E132 |
| 4.7 | same "Từ chối" / "Hủy báo giá" | rejectPurchaseQuotation / cancelPurchaseQuotation | POST .../reject, /cancel | purchasing:approve | ctrl:177 -> svc:660; ctrl:196 -> svc:683 | purchase_quotations; cancel also deletes pending DMH | PENDING_APPROVAL -> REJECTED (terminal); APPROVED -> CANCELLED | E118 E133 |
| 4.8 | `/manage/purchase-orders/$purchaseOrderId` "Xác nhận đặt hàng" | confirmPurchaseOrder | POST .../:id/confirm | purchasing:update | ctrl:124 -> svc:702 | purchase_orders | DMH PENDING_CONFIRMATION -> ORDERED | E122 E134 E156 E135 |
| 4.9 | same "Huỷ đơn" / "Đóng sớm PO" | cancelPurchaseOrder / closePurchaseOrder | POST .../cancel, /close | purchasing:approve | ctrl:141 -> svc:743; ctrl:160 -> svc:913 | purchase_orders, purchase_order_items; X-DOMAIN payment_requests(+logs), inv_receipts (DRAFT -> CANCELLED), purchase_quotations (revert to DRAFT) | -> CANCELLED; close keeps ORDERED + `closedAt` | E122 E124 E133 E285 E286 |
| 4.10 | `/manage/inventory-receipts/create-receipt` (lane PO) "Xác nhận & Gửi IQC" | createInventoryReceipt then confirmInventoryReceipt (see 3.1) | POST /inventory-receipts (+ /confirm) | inventory:create / inventory:update | ctrl:69 -> svc:426; ctrl:114 -> svc:559 | inv_receipts, inv_receipt_items, quality_inspections | -> DRAFT -> PENDING_IQC | E145 E127 E154 E315 |
| 4.11 | `/manage/iqc/$iqcId` "Lưu" (3.3), then receipt detail "Xác nhận nhập kho" | postInventoryReceipt | POST .../:receiptId/post | inventory:update | ctrl:131 -> svc:642 | inv_receipts, inv_balances, inv_transactions (RECEIPT +qty); X-DOMAIN payment_requests via createIfOrderCompleted (`payment-requests.service.ts:631`) | receipt IQC_COMPLETED\|PENDING_RECEIPT -> POSTED; YCTT -> DRAFT when received >= ordered | E153 E098 |
| 4.12 | `/manage/payment-requests/$paymentRequestId` "Đề nghị thanh toán" ("Đề nghị lại" when REJECTED) | sendPaymentRequest | POST .../:id/send | purchasing:update | ctrl:102 -> svc:422 | payment_requests, payment_request_logs | DRAFT\|REJECTED -> PENDING | E158 |
| 4.13 | same "Xác nhận thanh toán" (dialog "Xác nhận đã thanh toán") | markPaymentRequestPaid | POST .../:id/mark-paid | purchasing:approve | ctrl:86 -> svc:377 | payment_requests, payment_request_logs | PENDING -> PAID | E158 |
| 4.14 | same "Từ chối thanh toán" / "Hủy yêu cầu" | rejectPaymentRequest / cancelPaymentRequest | POST .../reject, /cancel | purchasing:approve | ctrl:119 -> svc:454; ctrl:208 -> svc:406 | payment_requests, payment_request_logs | PENDING -> REJECTED; DRAFT\|PENDING\|REJECTED -> CANCELLED | E158 E284 |
| 4.15 | PO detail advance payment dialog (label unverified) | updatePurchaseOrderAdvancePayment | PATCH .../:id/advance-payment | purchasing:update | ctrl:87 -> svc:603 | purchase_orders; X-DOMAIN payment_requests(+logs) via applyAdvancePayment (:650) | amount only | E312 E313 E317 E284 E316 |

Read-only chain views: purchase notes = `PurchaseNotesService` (no controller), exposed as GET `.../related-notes` on purchase-requests (ctrl:264 -> notes svc:37), purchase-quotations (ctrl:215 -> :60), purchase-orders (ctrl:179 -> :83), inventory-receipts (ctrl:173 -> :103); FE fns `get-*-related-notes.api.ts`. Purchase ledger = GET /purchase-ledger (ctrl:26 -> `getPurchaseLedgers` svc:63, + /export ctrl:39 -> :196): derived per request line, no FK to payment requests; status derived (`buildLedgerStatus` svc:343). No create route exists for DMH or YCTT. Source: BE purchasing.md sections 3-4.

## 5. Outsourcing: OS-OUT -> OS-IN -> back into JOB operation

```
JOB tab operations "Gửi gia công ngoài" (OUTSOURCE op, JOB IN_PROGRESS) -> /manage/outsourcing-orders/create (prefilled)
 OS-OUT "Xác nhận tạo phiếu" --> DRAFT -> "Gửi duyệt" PENDING_APPROVAL -> "Duyệt phiếu" APPROVED (or "Từ chối" REJECTED -> edit -> resubmit)
   -> "Xác nhận xuất gia công" SENT (no stock move) -> OS-IN create "Xác nhận nhập" --> POSTED
 OS-OUT SENT -> PARTIAL (received < sent) | WAITING_QC (full, IQC open) | COMPLETED;  op completedQuantity += received; FG op done -> JOB WAITING_QC
```

| # | UI route + button | FE server fn | METHOD /api/... | Perm | BE handler -> service | Tables written | Status | Blocking errors |
|---|---|---|---|---|---|---|---|---|
| 5.1 | wizard picker (GET /outsourcing-orders/outsourceable-operations) | getOutsourceableOperations | GET | outsourcing:read | ctrl:49 -> svc:228 | - | JOB IN_PROGRESS + OUTSOURCE ops only | - |
| 5.2 | `/manage/outsourcing-orders/create` "Xác nhận tạo phiếu" | createOutsourcingOrder (`outsourcing-orders/create-outsourcing-order.api.ts`) | POST /outsourcing-orders | outsourcing:create | createOutsourcingOrder | outsourcing_orders, outsourcing_order_items | -> DRAFT (approval steps: see production.md outsourcing-orders) | E019 E182 E183 E280 E184 |
| 5.3 | `/manage/outsourcing-receipts/create` (picker GET .../pending-order-items) "Xác nhận nhập" | createOutsourcingReceipt (`outsourcing-receipts/create-outsourcing-receipt.api.ts`) | POST /outsourcing-receipts | outsourcing:create | ctrl:89 -> svc:355 | outsourcing_receipts(+items); X-DOMAIN quality_inspections (IQC if requiresIqc), outsourcing_orders.status (:427), production_job_operations progress (:437); FG op -> production_jobs | OS-IN -> POSTED; OS-OUT SENT -> PARTIAL\|WAITING_QC\|COMPLETED; JOB IN_PROGRESS -> WAITING_QC when no FG op pending | E185 E186 E187 E171 E172 |
| 5.4 | IQC for the OS-IN line: `/manage/iqc/$iqcId` "Lưu" | confirmIqc | POST /iqc/:iqcId/confirm | iqc:update | ctrl:104 -> svc:673 (:879 recompute) | quality_inspections, outsourcing_orders, production_jobs | OS-OUT WAITING_QC -> COMPLETED | E159 |
| 5.5 | OS-IN return to supplier: supplier-return post (3.4) | postSupplierReturn | POST .../post | inventory:update | ctrl:82 -> svc:336 (:437/:448) | outsourcing_orders, production_job_operations | OS-OUT and op progress can regress (COMPLETED -> PARTIAL\|SENT) | E137 |
| 5.6 | detail cancel actions (labels unverified) | cancelOutsourcingReceipt / cancelOutsourcingOrder | POST .../:id/cancel | outsourcing:update | ctrl:105 -> svc:445; ctrl:111 -> svc:391 | outsourcing_receipts, outsourcing_orders, op progress | OS-IN POSTED -> CANCELLED; OS-OUT -> CANCELLED (final) | E098 E173 E169 |

Outsourcing writes no ledger rows (legacy reference types only). Source: BE production.md section 3.

## 6. Inventory side effects: where stock moves, reserves, releases

Ledger writer is only `InventoryPostingService.postDocument` (`inventory-posting.service.ts:47`) and `reverseDocument` (:66). Callers (verified by grep):

| Stock event | Step | Caller | Ledger type, sign | Guard |
|---|---|---|---|---|
| Purchase / return / other / FG receipt post | 2.8, 4.11 | `inventory-receipts.service.ts:669` | RECEIPT (+), PRODUCTION_IN (+); net of POSTED supplier returns | E153 IQC done |
| Requisition PXK post "Xuất kho" (`/manage/inventory-issues/$issueId`) | 6.3 | `inventory-issues.service.ts:367` | PRODUCTION_OUT (-) | E203 pending IQC, E106 |
| DO issue post | 1.9 | `inventory-issues.service.ts:378` (`postInventoryIssue`) | ISSUE (-) with orderItemId | E237, E106 |
| Supplier return post | 3.4 | `supplier-returns.service.ts:356` | ISSUE (-); skipped if OS-IN origin or source receipt not POSTED | E106 |
| Adjustment post / cancel (reversal) | BE only, no FE server fn | `inventory-adjustments.service.ts:212 / :251` | ADJUSTMENT_IN / OUT | E106 |
| Outsourcing OS-OUT / OS-IN | 5.2, 5.3 | none | no ledger write | - |
| Directs list `/manage/inventory-directs` | - | read-only | - | - |

Requisition steps (stock-reservation chain):

| # | UI route + button | FE server fn | METHOD /api/... | Perm | BE handler -> service | Tables written | Status | Errors |
|---|---|---|---|---|---|---|---|---|
| 6.1 | `/manage/inventory-requisitions/create` "Tạo phiếu lãnh vật tư" | createInventoryRequisition | POST /inventory-requisitions | inventory-requisitions:create | ctrl:88 -> svc:185 | inventory_requisitions(+items) | -> DRAFT | E228 E229 E230 E231 E232 E233 E087 E007 |
| 6.2 | `.../$requisitionId` "Gửi duyệt" ("Gửi duyệt lại" when REJECTED) | sendInventoryRequisition | POST .../:id/send | inventory-requisitions:update | ctrl:135 -> svc:292 | inventory_requisitions | DRAFT\|REJECTED -> PENDING_APPROVAL | E224 E227 |
| 6.3 | same "Duyệt" | approveInventoryRequisition | POST .../:id/approve | inventory-requisitions:approve | ctrl:153 -> svc:318 | inventory_requisitions, inv_issues + items (DRAFT PXK, PRODUCTION); no ledger write | PENDING_APPROVAL -> APPROVED (holds stock); PXK DRAFT | E225 E227 E231 |
| 6.4 | `/manage/inventory-issues/$issueId` "Xuất kho" | postInventoryIssue | POST .../:issueId/post | inventory:update | ctrl:104 -> svc:346 | inv_issues, inv_balances, inv_transactions, inventory_requisitions | PXK DRAFT -> POSTED; requisition -> ISSUED (hold becomes stock-out) | E098 E203 E106 |
| 6.5 | same "Hủy phiếu" | cancelInventoryIssue | POST .../:issueId/cancel | inventory:update | ctrl:121 -> svc:403 | inv_issues, inventory_requisitions | PXK -> CANCELLED; requisition -> CANCELLED (releases hold) | E098 |
| 6.6 | requisition reject | rejectInventoryRequisition | POST .../:id/reject | inventory-requisitions:approve | ctrl:169 -> svc:374 | inventory_requisitions | PENDING_APPROVAL -> REJECTED | E225 |

Reservation map (available = onHand - held - remaining BOM demand, `available-quantity.query.ts:14`):

| Holds stock | While | Released by |
|---|---|---|
| FG: DO (`HOLDING_STATUSES`, `outbound-orders.query.ts:16`) | DRAFT, PENDING_APPROVAL, PENDING_DELIVERY | post of its SALES issue (becomes ISSUE), cancel, delete |
| DIRECT: requisition (`HOLDING_STATUS`, `inventory-requisitions.query.ts:16`) | APPROVED only | PXK post (ISSUED) or cancel |
| DIRECT: remaining JOB BOM demand (`production_job_issues`) | JOB PENDING/IN_PROGRESS minus issued | issuing via 6.4 |
| none (read-only plan) | SO approve `getInitialPlanItems` sizes LSX qty from stock, writes no hold | - |

BE routes with no FE server fn (cannot be triggered from UI): `POST /inventory-requisitions/:id/cancel` (UI cancels via the PXK, 6.5), `POST|PATCH|DELETE /inventory-issues` (manual PXK; E234 forbids manual PRODUCTION type), all `/inventory-adjustments`, `GET /inventory/balances|transactions`. Source: BE inventory.md sections 3-5.

## 7. Disagreements (BE codemap vs code vs FE vs ui-flow.md)

| # | Where | Statement A | Statement B (verified) |
|---|---|---|---|
| D1 | ui-flow Flow 2 steps 4-5 and screen map | PO "tự sinh `DRAFT`", "DRAFT -> ORDERED", "Tạo PO thủ công", `/purchase-orders/create` | BE enum PENDING_CONFIRMATION (FE `purchase-order.type.ts` has no DRAFT); no create route, no manual button, no `POST /purchase-orders` |
| D2 | ui-flow Flow 2 step 4 | RFQ reject -> `CANCELLED` | BE and FE enum: reject -> REJECTED (terminal); CANCELLED only via "Hủy báo giá" from APPROVED |
| D3 | ui-flow Flow 1 step 6 | "Hủy LSX" button | Absent: `ProductionOrderDetailActions.tsx:51` states no cancel endpoint |
| D4 | ui-flow Flow 3 step 1 | "Bắt đầu SX" | Header button "Xác nhận kế hoạch", confirm dialog "Xác nhận" (`ProductionJobHeaderActions.tsx`, `StartProductionJobDialog.tsx`); "Bắt đầu SX" is only a job-log label |
| D5 | ui-flow Flow 3 step 4 / F10 | "Duyệt công đoạn" inline, NOT_STARTED -> DONE | No such string in `src`; reporting is "Nhập báo cáo" dialog -> "Lưu báo cáo" (2.5) |
| D6 | ui-flow Flow 1 step 9 | DO buttons "Gửi duyệt" -> "Duyệt" -> "Giao hàng" | "Gửi duyệt DO" -> "Duyệt" -> warehouse "Xuất kho" on the generated issue |
| D7 | ui-flow Flow 1 step 10 | SO `AWAITING_PRODUCTION`/`IN_PROGRESS` -> COMPLETED on full delivery | BE `closeOrdersIfFullyDelivered` updates only `IN_PROGRESS` (`outbound-orders.query.ts:168+`, BE sales.md agrees) |
| D8 | ui-flow F6 and screen map ("không có route chi tiết") | `/manage/inventory-issues` list-only | Route `/manage/inventory-issues/$issueId` exists; "Xuất kho"/"Hủy phiếu" live there (`InventoryIssueDetailActions.tsx`) |
| D9 | ui-flow Flow 3 step 3 | requisition detail has "Xuất kho" | Requisition detail only links to the PXK; "Xuất kho" is on the issue detail (6.4) |
| D10 | ui-flow Flow 2 diagram, Flow 3 steps 7, 10 | "Xác nhận kết quả" (OQC), "PASS -> Hoàn thành" / "Kho xuất trả NCC" (IQC), OS-IN "Xác nhận" | Single submit "Lưu" for OQC and IQC; supplier-return button "Xác nhận xuất"; OS-IN "Xác nhận nhập"; OS-OUT "Xác nhận tạo phiếu" (create already yields SENT, no separate "Gửi gia công ngoài" send call) |
| D11 | ui-flow Flow 1 step 3 | "Gửi duyệt" only from DRAFT | UI also shows it for REJECTED; BE honours explicit `status` on a REJECTED order (`orders.service.ts` updateOrder), BE sales.md only documents REJECTED -> DRAFT |
| D12 | FE comment `OutboundOrderDetailActions.tsx:28-29` | approve "cũng gate E205" | BE calls `ensureAllJobsQcCompleted` only in send (`outbound-orders.service.ts:583`); BE sales.md agrees with code |
| D13 | BE quality.md route table | controller lines IQC confirm :96, NCR patch :77, approve :104, production-order :141, oqc :175; OQC confirm :67 | Actual: iqc ctrl:104, ncrs ctrl:83 / :107 / :147 / :181, oqc ctrl:74 (FE input JSON `beAt` agrees with code). Also NCR service saveCostLines :480 (codemap :478), createOqcForJob :470 (:464), confirmOqc :545 (:539) |
| D14 | BE production.md service lines | createJobs :700, startJob :807, reloadSnapshot :743, addIssues/updateIssue/removeIssue :759/770/782, exec report :476, OS-OUT create/cancel :355/:388, OS-IN create/cancel :349/:439, `startJob` shortage call :848, closeJobIfFinalAssemblyDone caller :592 | Actual :705, :819, :749, :771/782/794, :479, :358/:391, :355/:445, :860, :595 |
| D15 | BE inventory.md receipt lines | create 427, confirm 560, post 643, cancel 861, closeJobIfFullyReceived 715 | Actual 426, 559, 642, 860, 714 (off by one) |
| D16 | BE purchasing.md `closePurchaseOrder` | lists writes purchase_order_items, purchase_orders, payment_requests | Also calls `createIfOrderCompleted` (`purchase-orders.service.ts:953`); not stated in section 5 |
| D17 | BE production.md `requestJobQc` | writes "unverified" | Verified: inserts `quality_inspections` DRAFT + OQC code sequence (`oqc.service.ts:470-540`) |
| D18 | FE comment `CreateOutsourcingOrderConfirmSection.tsx:258` | 'Bấm "Xác nhận đã gửi" trên phiếu' | No such action or server fn; OS-OUT is born SENT |
