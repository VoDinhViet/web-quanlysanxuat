export function LoginFormHeader() {
  return (
    <div className="mb-10">
      <div className="mb-2 flex items-end gap-4">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          Cổng xác thực
        </p>
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Đăng nhập
      </h1>
      <p className="mt-4 text-base leading-6 text-muted-foreground">
        Xác thực tài khoản để truy cập hệ thống quản lý sản xuất.
      </p>
    </div>
  )
}
