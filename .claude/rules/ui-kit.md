---
paths:
  - "src/components/**"
  - "src/features/*/components/**"
---

## Nguyên tắc

> **Component dùng chung sở hữu phần vỏ**: layout, spacing, state machine, markup, _hình dạng_
> plumbing của query/mutation.
> **Domain sở hữu phần ruột**: columns, nhãn tiếng Việt, map status→tone, query key, business
> gate.

Phép thử trước khi viết component mới: _xoá tên entity khỏi file, còn gì đặc thù không?_ Không
còn gì → `src/components/shared/`; còn logic vòng đời/nghiệp vụ thật → ở lại feature.

Mọi component — ở `src/components/shared/` hay `src/features/<domain>/components/` — thuộc đúng
1 trong 4 tầng:

- `layouts/` — chứa section khác.
- `sections/` — một vùng trang, thường sở hữu query/form state.
- `composites/` — ghép primitive thành đơn vị tái dùng, không chiếm vùng cố định.
- `primitives/` — phần còn lại.

Kit được dựng dần: mỗi mảnh ship cùng commit với 1 migration chứng minh nó, không land file
chưa ai dùng. Khi feature khác cần một component dưới đây, import thẳng, đừng viết lại.

**Kit chỉ phục vụ `inventory-requisitions`** (trừ `TimelineCard`/`StatusNotice`, đã dùng ở nhiều
feature). Ghép `purchase-requests` lên `StatusBadge`, `ConfirmActionDialog`/`ReasonDialog` và
`DetailHeader` đều đã bị yêu cầu revert — **không ghép thêm feature nào vào kit, và đừng tự ý
thêm component của feature khác vào bảng này; hỏi trước.**

## Component hiện có

| Tầng          | Component                  | Prop chính                                                                                                                                        |
| ------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `layouts/`    | `PageShell`                | `title`, `breadcrumbs: PageTitleBreadcrumb[]` (chỉ crumb sau "Bảng điều khiển" — tự thêm), `children`                                             |
| `layouts/`    | `PageBody`                 | `className?`, `children` — `flex flex-col gap-4` luôn bật                                                                                         |
| `layouts/`    | `DetailColumns`            | `main`, `sidebar`, `className?` — sidebar cố định 320px (khớp `inventory-requisitions`; thêm prop `sidebarWidth` khi domain thứ 2 cần width khác) |
| `layouts/`    | `WizardStepsTabs`          | `steps: {value, label, icon, disabled?}[]` — chỉ vẽ `TabsList`/`TabsTrigger`; `Tabs` root + `TabsContent` ở form                                  |
| `sections/`   | `TableQueryBoundary`       | `query`, `loadingRows`, `children: (data) => ReactNode` (render-prop để `data` narrow trong component)                                            |
| `composites/` | `TimelineCard`             | `icon`, `title`, `steps: TimelineStep[]`, `variant?: "circle"\|"dot"`, `noteToneClassName?`                                                       |
| `composites/` | `Pagination`               | `page`, `pageSize`, `total`, `onPageChange`, `onPageSizeChange?`, `disabled?`, `className?`, `container?` — thuần presentational, luôn hiện       |
| `composites/` | `StatusLegend`             | `icon`, `title`, `items: {key, badge: ReactNode, description}[]`                                                                                  |
| `composites/` | `StatusNotice`             | `title`, `reason`, `actorName?`, `timestamp?` (`dd/MM/yyyy HH:mm` nội bộ), `extra?`                                                               |
| `composites/` | `JobOperationReportDialog` | `row: JobOperationReportRow`, `disabledReason: string \| null` (null = nhập được), `trigger`; kèm `resolveJobOperationReportDisabledReason(...)`  |
| `primitives/` | `RowActions`               | `children`, `className?` — chỉ bọc `flex items-center justify-center gap-1.5`                                                                     |

- `Pagination` không tự patch route: list page có `page`/`limit` trên URL bind qua
  `useRoutePagination` (`src/hooks/use-route-pagination.ts`); state cục bộ (picker trong wizard)
  bind thẳng `onPageChange={setPage}`.
- `JobOperationReportDialog` là đúng một instance ghi đúng một entity
  (`production_job_operations`) qua một mutation, render bởi 2 màn. Data layer ở lại
  `production-jobs`; shared UI gọi ngược qua `@/features/production-jobs/api`.

## Cố ý KHÔNG abstract

Mỗi feature tự dựng, không qua component chung:

- **`build*Timeline`** — mỗi hàm mang luật vòng đời riêng; chỉ shell hiển thị (`TimelineCard`)
  dùng chung.
- **Dialog xác nhận / dialog có lý do** (`AlertDialog`/`Dialog` + `useState(open)` +
  `useMutation`) — đã gộp thử thành `ConfirmActionDialog`/`ReasonDialog` rồi revert.
- **Status badge** (`<Badge>` + dot) — đã thử `StatusBadge` rồi revert; badge không đảm bảo luôn
  cùng hình dạng ở domain khác. `Record<XStatus, BadgeStyle>` luôn ở feature: chọn status nào là
  "warning"/"destructive" là quyết định sản phẩm.
- **Detail header / info card shell** (back-link + code + badge + meta grid) — đã thử
  `DetailHeader`/`SectionCard`/`InfoFields` rồi revert; `MetaField`/`InfoRow` là hàm private
  cuối file.
- **`*TableColumns`**, **nội dung `TableEmpty`** — cột, nhãn tiếng Việt, icon/title luôn ở
  feature.
- **`DataTable`**, **`TableFilterBar`/`FilterSelect`**, **`useFilterSearchTerm`** — mỗi cái chỉ
  có 1 caller nên bỏ; mỗi bảng/filter bar tự dựng `Table`/`flexRender`, `Select`,
  `useState` + `useDebounceCallback`.
- **`resetFilters`/`handleXChange`** — closure ghi `navigate({search})` giữ type theo search
  schema của route; signature chung sẽ ép `as` cast ở mọi call site.
- **`<Link to params>` của row action / nút Back** — extract sẽ mất type-check route param; để
  làm slot tại call site.
- **`reject-*.schema.ts`** — là `.validator()` của server function (trust boundary), không rút
  thành schema chung.
- **`*StatCards.tsx`** (`orders`/`iqc`/`suppliers`/`manage`) — 4 file lệch nhau về layout (dọc
  trong `Card` vs ngang icon cạnh text) và hình dạng dòng phụ (trend 3-tone / percent / subtitle
  / trend không tone); một component linh hoạt đủ cho cả 4 cần nhiều prop biến thể hơn mọi kit
  component khác, đổi lại rất ít. Chỉ cân nhắc gộp riêng 3 file layout ngang, không kèm `orders`.
- **`StatusLegend` dạng `dl`/`dt`/`dd`** (`OrderStatusLegend`, `PurchaseOrderLegend`, …) và
  **`StatusNotice` dạng shadcn `Alert`** (`orders`/`outbound-orders`) — chưa hợp nhất với bản kit
  (`ul`/`li` + badge qua slot; hand-rolled div). Hợp nhất khi feature đó thực sự migrate; icon
  package cũng khác (`@solar-icons/react` vs `lucide-react`).

## Trước khi viết component mới

1. Tìm trong `src/components/shared/{layouts,sections,composites,primitives}/` — shape này có
   rồi chưa?
2. Áp phép thử "xoá tên entity, còn gì đặc thù không?" và chọn đúng 1 trong 4 tầng.
3. Không land component dùng chung một mình — ship cùng 1 migration thật trong cùng commit.
4. Nếu 2+ bản sao lệch nhau về **cấu trúc** (không chỉ giá trị class), đừng ép vào 1 component
   nhiều prop biến thể: gộp phần gần giống trước (bỏ phần lệch), hoặc hỏi lại.
5. `as` cast phát sinh từ việc tách component là hợp lệ nếu nó đã tồn tại ở bản gốc (ví dụ
   `Number(key) as PageSize` trong `Pagination`).
