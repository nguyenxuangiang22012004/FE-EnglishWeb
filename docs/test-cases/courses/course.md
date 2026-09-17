# Test Cases: Chức Năng Khóa Học & Học Tập Theo Chủ Đề (Courses & Topic Learning)

Status: active
Owner: TEST
Related:
  - Requirement: docs/requirements/programs/course.md
  - API: docs/api/courses/
  - Security: docs/security/

## 1. Danh sách Test Cases

### CRS-TC-001 - Xem danh sách khóa học (Course List)
- **Status:** passed
- **Priority:** high
- **Type:** functional
- **Preconditions:** Đã khởi động hệ thống FE và BE.
- **Steps:**
  1. Điều hướng tới `/courses`.
  2. Kiểm tra giao diện danh sách khóa học, ảnh bìa, tiêu đề, mô tả và cấp độ (level).
  3. Kiểm tra phân trang nếu có nhiều hơn 1 trang khóa học.
- **Expected Results:**
  - Hiển thị danh sách khóa học đầy đủ, đúng tên và tag cấp độ.
  - Phân trang hoạt động chính xác theo 0-based page index của Spring Boot.

### CRS-TC-002 - Xem chi tiết khóa học và danh sách chủ đề (Course Detail & Topics)
- **Status:** passed
- **Priority:** high
- **Type:** functional
- **Preconditions:** Có ít nhất 1 khóa học với danh sách chủ đề trong hệ thống.
- **Steps:**
  1. Tại `/courses`, nhấp chọn 1 khóa học.
  2. Kiểm tra header thông tin khóa học, nút quay lại `←`.
  3. Kiểm tra danh sách chủ đề (Topics): chủ đề đầu tiên mở khóa, các chủ đề sau bị khóa (🔒) nếu chưa hoàn thành chủ đề trước đó.
- **Expected Results:**
  - Hiển thị tiêu đề, mô tả và danh sách chủ đề theo đúng thứ tự `orderIndex`.
  - Khóa chủ đề tiếp theo theo quy tắc hoàn thành (`isPassed = true`).

### CRS-TC-003 - Học chủ đề qua các dạng bài (Topic Learning Flow)
- **Status:** passed
- **Priority:** high
- **Type:** functional
- **Preconditions:** Chủ đề ở trạng thái mở khóa.
- **Steps:**
  1. Bấm vào chủ đề mở khóa để vào `/courses/[id]/topic/[topicId]`.
  2. Kiểm tra màn hình chào Mascot Dialog, thanh tiến trình `0/N`, nút "Tiếp tục".
  3. Bấm "Tiếp tục" chuyển sang bài học từ vựng (Vocabulary): kiểm tra lật thẻ, phát âm audio, nút ghi âm.
  4. Kiểm tra nút "✕" để thoát và quay lại màn hình chi tiết khóa học.
- **Expected Results:**
  - Chuyển bước mượt mà, lưu tiến trình học `IN_PROGRESS` lên backend.
  - Khi thoát, trạng thái chủ đề hiển thị badge "Đang học" cùng tiến độ bước hiện tại.

### CRS-TC-004 - Phân quyền truy cập công khai và quản trị (Security & RBAC)
- **Status:** passed
- **Priority:** high
- **Type:** permission
- **Preconditions:** Người dùng khách (chưa đăng nhập) hoặc đăng nhập với các role khác nhau.
- **Steps:**
  1. Người dùng chưa đăng nhập truy cập danh mục khóa học `/courses` và chi tiết `/courses/[id]`.
  2. Người dùng ADMIN truy cập trang quản trị khóa học `/admin/courses`.
- **Expected Results:**
  - GET `/v1/courses/**` cho phép truy cập công khai để xem danh mục.
  - Các thao tác thay đổi (POST, PUT, DELETE) yêu cầu quyền `ROLE_ADMIN`.
  - Tiến trình học cá nhân `/my-progress` yêu cầu người dùng đã xác thực.
