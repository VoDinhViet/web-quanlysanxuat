// Router-level 404 — moved out of __root.tsx so it's defined once and shared
// as `defaultNotFoundComponent`, not just the root route's own notFoundComponent.
export function DefaultNotFound() {
  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>Không tìm thấy trang bạn yêu cầu.</p>
    </main>
  )
}
