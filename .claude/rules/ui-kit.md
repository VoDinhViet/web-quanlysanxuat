## Governing principle

> **Component dùng chung sở hữu phần vỏ**: layout, spacing, state machine, markup, *hình dạng*
> plumbing của query/mutation.
> **Domain sở hữu phần ruột**: columns, nhãn tiếng Việt, map status→tone, query key, business
> gate.

Test trước khi viết component mới: *xoá tên entity khỏi file này, còn lại gì đặc thù không?* —
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

## Bảng component

### `src/components/shared/layouts/`

| Component | Prop chính | Call site |
|---|---|---|
| `PageShell` | `title: string`, `breadcrumbs: PageTitleBreadcrumb[]` (chỉ crumb sau "Bảng điều khiển" — component tự thêm), `children` | `src/routes/(authed)/manage_/inventory-requisitions/route.tsx` |
| `PageBody` | `className?`, `children` — `flex flex-col gap-4` luôn bật, vô hại với 1 con duy nhất | `InventoryRequisitionsPage.tsx` |
| `DetailColumns` | `main: ReactNode`, `sidebar: ReactNode`, `className?` — sidebar cố định 320px | `InventoryRequisitionDetailPage.tsx` |
| `SectionCard` | `icon`, `title`, `action?`, `className?`, `contentClassName?` (thay hẳn padding mặc định, không merge), `children` | `InventoryRequisitionInfoCard.tsx` |
| `DetailHeader` | `back: ReactNode` (nút Back đầy đủ, giữ type-check route tại call site), `code`, `badge`, `meta: ReactNode` (caller tự dựng grid), `actions?` | `InventoryRequisitionDetailHeader.tsx` |
| `WizardStepsTabs` | `steps: {value, label, icon: ComponentType<LucideProps>, disabled?}[]` — chỉ vẽ `TabsList`/`TabsTrigger`, `Tabs` root + `TabsContent` ở form | `CreateInventoryRequisitionStepsTabs.tsx` |

### `src/components/shared/sections/`

| Component | Prop chính | Call site |
|---|---|---|
| `TableQueryBoundary` | `query: UseQueryResult<TData, Error>`, `loadingRows: number`, `children: (data: TData) => ReactNode` (render-prop — `data` chỉ narrow bên trong component) | `InventoryRequisitionsPage.tsx` |
| `TableFilterBar` | `createLabel?`, `createAction?` (cả 2 vắng = bỏ hẳn khối "tạo mới"), `fields: ReactNode` (caller tự dựng grid), `onReset` | `InventoryRequisitionsTableFilter.tsx` |

### `src/components/shared/composites/`

| Component | Prop chính | Call site |
|---|---|---|
| `TimelineCard` | `icon`, `title`, `steps: TimelineStep[]`, `variant?: "circle"\|"dot"`, `noteToneClassName?` | `OrderDetailTimelineCard.tsx` (+ purchase-orders, purchase-quotations, payment-requests) |
| `ConfirmActionDialog` | `trigger`, `icon`, `title`, `description`, `confirmLabel`, `cancelLabel?`, `destructive?`, `onConfirm: () => Promise<unknown>` (mutation + invalidate ở call site, invalidate không `await`), `isPending`, `error?`, `onOpenChange?` | `ApproveRequisitionDialog.tsx` (+ Cancel/Issue/Send) |
| `ReasonDialog` | `trigger`, `children: (close: () => void) => ReactNode` — Radix unmount khi đóng tự reset mutation, không cần `onOpenChange` | `RejectRequisitionDialog.tsx` |
| `DataTable` | `table: Table<TData>` (từ `useReactTable`), `isEmpty`, `emptyState: ReactNode` | `InventoryRequisitionsTable.tsx` |
| `LocalPagination` | `pagination: Pagination`, `limitOptions: readonly number[]`, `onPageChange`, `onLimitChange`, `disabled?` — em của `TablePagination` cho phân trang không có URL để patch | `CreateInventoryRequisitionPickerSection.tsx` |
| `TablePagination` | `pagination: Pagination`, `className?` — tự patch `page`/`limit` search param qua `navigate({to: "."})` | mọi list page (Phase 0) |
| `StatusLegend` | `icon`, `title`, `items: {key, badge: ReactNode, description}[]` | `InventoryRequisitionsLegend.tsx` |
| `StatusNotice` | `title`, `reason`, `actorName?`, `timestamp?` (format `dd/MM/yyyy HH:mm` nội bộ), `extra?: ReactNode` | `PurchaseOrderCancellationNotice.tsx` (+ `PurchaseRequestRejectionNotice.tsx`) |

### `src/components/shared/primitives/`

| Component | Prop chính | Call site |
|---|---|---|
| `MetaField` / `InfoRow` (`InfoFields.tsx`) | `{label, value: ReactNode}` — `MetaField` truncate (lưới cố định), `InfoRow` wrap (sidebar rộng) | `InventoryRequisitionDetailHeader.tsx` / `InventoryRequisitionInfoCard.tsx` |
| `StatusBadge` | `style: {badge, dot}` (domain tự giữ `Record<XStatus, BadgeStyle>`), `label`, `className?` | `InventoryRequisitionBadges.tsx` |
| `RowActions` | `children`, `className?` — chỉ bọc `flex items-center justify-center gap-1.5`, action con vẫn ở call site | `InventoryRequisitionsTableCells.tsx` |
| `TableSearchInput` | `id`, `label`, `placeholder`, `value`, `onChange`, `onKeyDown?` — ghép với `useFilterSearchTerm` | `InventoryRequisitionsTableFilter.tsx` |
| `FilterSelect` | `id`, `label`, `value`, `options: {value,label}[]`, `onValueChange` | `InventoryRequisitionsTableFilter.tsx` |

### `src/hooks/`

| Hook | Trả về | Call site |
|---|---|---|
| `useFilterSearchTerm({initialValue, onSearch, delay?})` | `{value, onChange, onEnterKeyDown, reset}` — debounce + Enter-to-flush; `onSearch` (viết search param của route) vẫn ở call site | `InventoryRequisitionsTableFilter.tsx` |

## Cố ý KHÔNG abstract (và lý do)

- **4 `build*Timeline`** (`orders`/`purchase-orders`/`purchase-quotations`/`payment-requests`) —
  mỗi hàm ghi luật vòng đời riêng thật (nhánh gửi-lại, trạng thái nào coi là "hiện tại"); chỉ
  shell hiển thị (`TimelineCard`) dùng chung.
- **`useMutation` + query key trong mọi dialog** — `ConfirmActionDialog`/`ReasonDialog` không
  bao giờ giữ mutation hay query key; ẩn nó đi sẽ mất khả năng đọc invalidate ở mỗi call site.
- **`Record<XStatus, BadgeStyle>`** — chọn status nào là "warning"/"destructive" là quyết định
  sản phẩm, khác nhau mỗi domain dù shell `StatusBadge` giống hệt.
- **`*TableColumns`** — định nghĩa cột (label tiếng Việt, cell renderer) luôn ở feature.
- **`resetFilters`/`handleXChange`** — đóng gói closure ghi `navigate({search: ...})` giữ type
  theo đúng search schema của route đó; một signature chung sẽ ép `as` cast ở mọi call site.
- **`<Link to=... params=...>` của row action / nút Back trong `DetailHeader`** — extract ra khỏi
  call site sẽ mất type-check route param; cả hai ở lại làm slot (`children`/`back`).
- **Nội dung `TableEmpty`** (icon/title/description) — luôn là prop của call site, `DataTable`
  chỉ quyết định *khi nào* hiện nó, không quyết định nó nói gì.
- **`reject-*.schema.ts`** — là `.validator()` của server function tương ứng (trust boundary),
  không rút thành schema dùng chung dù hình dạng field giống nhau.
- **`StatusLegend` flavor A** (`dl`/`dt`/`dd`, dùng bởi `OrderStatusLegend`/`PurchaseOrderLegend`/
  …) — chưa hợp nhất với flavor B (`ul`/`li` + `StatusBadge` thật) đã ship cho
  `inventory-requisitions`; 2 fork khác hẳn cấu trúc (đếm dot đơn giản có "1 shell" là ranh giới
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
