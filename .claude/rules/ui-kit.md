## Governing principle

> **Component dùng chung sở hữu phần vỏ**: layout, spacing, state machine, markup, _hình dạng_
> plumbing của query/mutation.
> **Domain sở hữu phần ruột**: columns, nhãn tiếng Việt, map status→tone, query key, business
> gate.

Test trước khi viết component mới: _xoá tên entity khỏi file này, còn lại gì đặc thù không?_ —
nếu không còn gì, nó thuộc `src/components/shared/`; nếu còn logic vòng đời/nghiệp vụ thật, nó ở
lại feature.

Mọi component trong repo — dù ở `src/components/shared/` hay `src/features/<domain>/components/`
— nằm trong đúng 1 trong 4 tầng (`layouts/` chứa section khác · `sections/` là một vùng trang,
thường sở hữu query/form state · `composites/` ghép primitive thành đơn vị tái dùng không chiếm
vùng cố định · `primitives/` còn lại). Xem "Standard layout"/"Layer boundaries" trong
`project-and-commands.md`/`architecture.md` cho định nghĩa đầy đủ 4 tầng.

Kit được dựng dần, **mỗi mảnh ship cùng commit với 1 migration chứng minh nó** — không land một
file chưa ai dùng. `inventory-requisitions` là feature mẫu cho phần lớn bảng dưới; vài mảnh
(`TimelineCard`, `StatusNotice`) ghép cùng 2+ feature khác ngay từ đầu vì đó là nơi bản sao thật
sự nằm. Khi một feature khác cần một trong các component này, import thẳng — đừng viết lại.

> **Phase 4 (mở rộng kit sang feature thứ 2) đã dừng.** Thử ghép `purchase-requests` lên
> `StatusBadge`, `ConfirmActionDialog`/`ReasonDialog`, rồi `DetailHeader` — cả 3 lần đều bị yêu
> cầu revert (xem "Cố ý KHÔNG abstract" bên dưới), và quyết định cuối là **không tiếp tục thử
> ghép thêm feature nào vào shared kit nữa** cho tới khi có chỉ đạo khác. Bảng dưới đây liệt kê
> đúng những gì còn sống, tất cả vẫn chỉ phục vụ `inventory-requisitions` (trừ `TimelineCard`/
> `StatusNotice`, vốn đã ghép nhiều feature từ Phase 2 gốc, không phải mở rộng thêm). Đừng tự ý
> gộp một component feature khác vào bảng này — hỏi trước.

## Bảng component

### `src/components/shared/layouts/`

| Component         | Prop chính                                                                                                                                   | Call site                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `PageShell`       | `title: string`, `breadcrumbs: PageTitleBreadcrumb[]` (chỉ crumb sau "Bảng điều khiển" — component tự thêm), `children`                      | `src/routes/(authed)/manage_/inventory-requisitions/route.tsx` |
| `PageBody`        | `className?`, `children` — `flex flex-col gap-4` luôn bật, vô hại với 1 con duy nhất                                                         | `InventoryRequisitionsPage.tsx`                                |
| `DetailColumns`   | `main: ReactNode`, `sidebar: ReactNode`, `className?` — sidebar cố định 320px                                                                | `InventoryRequisitionDetailPage.tsx`                           |
| `WizardStepsTabs` | `steps: {value, label, icon: ComponentType<LucideProps>, disabled?}[]` — chỉ vẽ `TabsList`/`TabsTrigger`, `Tabs` root + `TabsContent` ở form | `CreateInventoryRequisitionStepsTabs.tsx`                      |

### `src/components/shared/sections/`

| Component            | Prop chính                                                                                                                                                 | Call site                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `TableQueryBoundary` | `query: UseQueryResult<TData, Error>`, `loadingRows: number`, `children: (data: TData) => ReactNode` (render-prop — `data` chỉ narrow bên trong component) | `InventoryRequisitionsPage.tsx`        |
| `TableFilterBar`     | `createLabel?`, `createAction?` (cả 2 vắng = bỏ hẳn khối "tạo mới"), `fields: ReactNode` (caller tự dựng grid), `onReset`                                  | `InventoryRequisitionsTableFilter.tsx` |

### `src/components/shared/composites/`

| Component         | Prop chính                                                                                                                                                                | Call site                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `TimelineCard`    | `icon`, `title`, `steps: TimelineStep[]`, `variant?: "circle"\|"dot"`, `noteToneClassName?`                                                                               | `OrderDetailTimelineCard.tsx` (+ purchase-orders, purchase-quotations, payment-requests) |
| `LocalPagination` | `pagination: Pagination`, `limitOptions: readonly number[]`, `onPageChange`, `onLimitChange`, `disabled?` — em của `TablePagination` cho phân trang không có URL để patch | `CreateInventoryRequisitionPickerSection.tsx`                                            |
| `TablePagination` | `pagination: Pagination`, `className?` — tự patch `page`/`limit` search param qua `navigate({to: "."})`                                                                   | mọi list page (Phase 0)                                                                  |
| `StatusLegend`    | `icon`, `title`, `items: {key, badge: ReactNode, description}[]`                                                                                                          | `InventoryRequisitionsLegend.tsx`                                                        |
| `StatusNotice`    | `title`, `reason`, `actorName?`, `timestamp?` (format `dd/MM/yyyy HH:mm` nội bộ), `extra?: ReactNode`                                                                     | `PurchaseOrderCancellationNotice.tsx` (+ `PurchaseRequestRejectionNotice.tsx`)           |

### `src/components/shared/primitives/`

| Component          | Prop chính                                                                                                | Call site                              |
| ------------------ | --------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `RowActions`       | `children`, `className?` — chỉ bọc `flex items-center justify-center gap-1.5`, action con vẫn ở call site | `InventoryRequisitionsTableCells.tsx`  |
| `FilterSelect`     | `id`, `label`, `value`, `options: {value,label}[]`, `onValueChange`                                       | `InventoryRequisitionsTableFilter.tsx` |

### `src/hooks/`

| Hook                                                    | Trả về                                                                                                                           | Call site                              |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `useFilterSearchTerm({initialValue, onSearch, delay?})` | `{value, onChange, onEnterKeyDown, reset}` — debounce + Enter-to-flush; `onSearch` (viết search param của route) vẫn ở call site | `InventoryRequisitionsTableFilter.tsx` |

## Cố ý KHÔNG abstract (và lý do)

- **4 `build*Timeline`** (`orders`/`purchase-orders`/`purchase-quotations`/`payment-requests`) —
  mỗi hàm ghi luật vòng đời riêng thật (nhánh gửi-lại, trạng thái nào coi là "hiện tại"); chỉ
  shell hiển thị (`TimelineCard`) dùng chung.
- **Dialog xác nhận 1 hành động / dialog có lý do** (`AlertDialog` hoặc `Dialog` +
  `useState(open)` + `useMutation`) — thử gộp thành `composites/ConfirmActionDialog` +
  `ReasonDialog` ở Phase 2.5 (5 dialog `inventory-requisitions`), rồi thử ghép thêm 4 dialog
  `purchase-requests` ở Phase 4; **cả hai component và toàn bộ 9 migration đều bị revert**, cùng
  đợt với `StatusBadge` ở trên và cùng lý do — mỗi dialog quay lại tự dựng
  `AlertDialog`/`Dialog` + state + `useMutation` của riêng nó. (`DeletePurchaseRequestItemDialog.tsx`
  vốn đã có hành vi khác biệt thật — đóng dialog + toast thay vì ở lại hiện lỗi inline khi
  mutation lỗi — nên việc revert này cũng xoá luôn phần "giả lập" hành vi đó qua try/catch trong
  `onConfirm` mà lần migrate trước phải thêm vào.)
- **Status badge shell** (`<Badge variant="outline">` + dot span) — thử gộp thành
  `primitives/StatusBadge` ở Phase 2.4 (dùng bởi `inventory-requisitions`), rồi thử ghép thêm
  `purchase-requests` ở Phase 4; **cả hai đều bị revert**. Dù shell nhìn giống hệt ở 2 bản đầu,
  quyết định là badge không đảm bảo luôn cùng hình dạng ở domain khác (như `StatCardSection` —
  xem bên dưới), nên mỗi domain giữ nguyên `<Badge>` + `Record<XStatus, BadgeStyle>` +
  `cn(dot, className)` của riêng nó thay vì qua một shell chung. `Record<XStatus, BadgeStyle>`
  bản thân nó vẫn luôn ở lại feature dù có shell chung hay không — chọn status nào là
  "warning"/"destructive" là quyết định sản phẩm.
- **Detail header shell / info card shell** (back-link + code + badge + meta grid; card với
  header icon+title + nội dung) — thử gộp thành `layouts/DetailHeader` + `layouts/SectionCard` +
  `primitives/InfoFields` (`MetaField`/`InfoRow`) ở Phase 2.3 (dùng bởi `inventory-requisitions`),
  rồi thử ghép thêm `purchase-requests` ở Phase 4; **cả ba component và cả migration gốc đều bị
  revert**, cùng lý do với `StatusBadge`/`ConfirmActionDialog` ở trên dù không tìm thấy khác biệt
  cấu trúc nào giữa 2 domain — mỗi domain tự dựng lại block back+code+badge+meta-grid và
  `<section>` card của riêng nó, với `MetaField`/`InfoRow` là hàm private ở cuối file thay vì
  import từ `primitives/`.
- **`*TableColumns`** — định nghĩa cột (label tiếng Việt, cell renderer) luôn ở feature.
- **`resetFilters`/`handleXChange`** — đóng gói closure ghi `navigate({search: ...})` giữ type
  theo đúng search schema của route đó; một signature chung sẽ ép `as` cast ở mọi call site.
- **`<Link to=... params=...>` của row action / nút Back trong detail header** — extract ra khỏi
  call site sẽ mất type-check route param; cả hai ở lại làm slot tại call site (không qua shell
  chung — xem revert ở trên).
- **`DataTable`** (shell `useReactTable`/`flexRender` dùng chung, ghép ở Phase 0) — chỉ có đúng 1
  caller (`InventoryRequisitionsTable.tsx`) nên bị bỏ theo yêu cầu để mỗi bảng tự dựng shell
  `Table`/`TableHeader`/`TableBody`/`flexRender` độc lập, không qua component chung nữa.
- **Nội dung `TableEmpty`** (icon/title/description) — luôn là prop của call site; mỗi bảng tự
  quyết định _khi nào_ hiện nó ngay trong JSX của mình.
- **`reject-*.schema.ts`** — là `.validator()` của server function tương ứng (trust boundary),
  không rút thành schema dùng chung dù hình dạng field giống nhau.
- **`StatusLegend` flavor A** (`dl`/`dt`/`dd`, dùng bởi `OrderStatusLegend`/`PurchaseOrderLegend`/
  …) — chưa hợp nhất với flavor B (`ul`/`li` + badge thật của domain đó, qua slot `badge:
ReactNode`) đã ship cho `inventory-requisitions`; 2 fork khác hẳn cấu trúc (đếm dot đơn giản có "1 shell" là ranh giới
  của Phase 2.4). Hợp nhất khi feature dùng flavor A thực sự migrate.
- **`StatusNotice` fork A** (shadcn `Alert`, dùng bởi `orders`/`outbound-orders`) — chưa hợp nhất
  với fork B (hand-rolled div) đã ship cho `purchase-orders`/`purchase-requests`. Icon package
  cũng khác (`@solar-icons/react` vs `lucide-react`) — quyết định thống nhất để sau, khi 2 fork
  thực sự cần đứng cạnh nhau.
- **`*StatCards.tsx`** (`orders`/`iqc`/`suppliers`/`manage`) — **đã khảo sát cho một
  `StatCardSection` chung, quyết định KHÔNG gộp.** 4 file lệch nhau ở 2 trục thật, không chỉ
  class Tailwind: layout (`orders` dọc trong shadcn `Card`; `iqc`/`suppliers`/`manage` ngang,
  icon cạnh text) và hình dạng dòng phụ (trend 3-tone / percent trong ngoặc / subtitle luôn hiện
  / trend không tone — không 2 file nào giống nhau). Ép 1 component linh hoạt đủ cho cả 4 sẽ cần
  nhiều prop biến thể hơn bất kỳ kit component nào khác ở đây — đổi lấy rất ít, vì mỗi
  `*StatCards.tsx` chỉ có 1 bản sao (không như `*Table.tsx`/`*Dialog.tsx` có hàng chục bản).
  `manage.type.ts`'s `StatCard`/`TrendDirection` vẫn ở nguyên, chỉ dùng bởi
  `report-stats-tiles.ts`. Xem lại nếu sau này chỉ cần gộp riêng 3 file layout-ngang
  (`iqc`/`suppliers`/`manage`), không kèm `orders`.
- **`DetailColumns` sidebar 320px** — khớp `inventory-requisitions`; domain khác (`orders` 360px,
  …) chưa migrate. Thêm prop `sidebarWidth` (literal-class lookup, không nội suy Tailwind) khi
  domain thứ 2 thật sự cần width khác.

## Trước khi viết component mới

1. Tìm trong `src/components/shared/{layouts,sections,composites,primitives}/` trước — shape này
   có rồi chưa?
2. Áp phép thử "xoá tên entity, còn gì đặc thù không?". Còn logic vòng đời/nghiệp vụ thật → ở lại
   feature. Không còn gì → `shared/`, đúng tầng theo 4 câu hỏi trong `architecture.md`.
3. Không land component dùng chung một mình — ship cùng 1 migration thật trong cùng commit.
4. Nếu 2+ bản sao lệch nhau về **cấu trúc** (không chỉ giá trị class) — layout khác hẳn, dữ liệu
   dòng phụ không chung shape — đừng ép vào 1 component nhiều prop biến thể. Cân nhắc: gộp phần
   gần giống nhau trước (bỏ phần lệch), hoặc hỏi lại trước khi build (xem case `StatCardSection`
   ở trên).
5. `as` cast phát sinh từ việc tách component (ví dụ `LocalPagination`'s `onLimitChange` trả về
   `number` trần) là hợp lệ nếu nó đã tồn tại ở bản gốc trước khi tách — không phải cast mới do
   thiết kế cẩu thả.
