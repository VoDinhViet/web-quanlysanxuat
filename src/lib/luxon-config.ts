import { Settings } from "luxon"

// ERP nội bộ chỉ dùng ở Việt Nam. Không set thì Settings.defaultZone mặc định là "system" —
// server (thường TZ=UTC trên container) và trình duyệt (giờ VN, +07:00) format cùng một
// DateTime.fromISO(...).toFormat(...) ra text khác nhau, gây hydration mismatch (React vứt bỏ
// HTML server-render, render lại phía client) mỗi lần F5. Cố định một zone để cả hai môi trường
// luôn ra cùng kết quả.
Settings.defaultZone = "Asia/Ho_Chi_Minh"
