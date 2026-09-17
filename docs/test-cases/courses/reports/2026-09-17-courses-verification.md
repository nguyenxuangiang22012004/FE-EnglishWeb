# Báo Cáo Kiểm Thử Chức Năng Khóa Học (Courses Feature Verification)

- **Ngày thực hiện:** 2026-09-17
- **Môi trường test:** Local (`http://localhost:3000`)
- **Người thực hiện:** AI Pair Programmer (Tester & Dev)
- **Tài liệu quy trình:** [dev-workflow.md](file:///e:/web-hoc-tieng-anh/FE-WebHocTiengAnh/docs/ai/dev/dev-workflow.md), [tester-workflow.md](file:///e:/web-hoc-tieng-anh/FE-WebHocTiengAnh/docs/ai/testing/tester-workflow.md)

---

## 1. Mục tiêu kiểm thử & Sửa lỗi (Fixes)

1. **Kiểm tra phân trang danh sách khóa học:** Khắc phục lỗi lệch chỉ mục trang giữa `CourseListPage.tsx` (1-indexed nhầm lẫn với 0-indexed Spring Boot) và component `Pagination.tsx`.
2. **Cấu hình phân quyền Spring Security (`SecurityConfig.java`):** Cho phép truy cập công khai (Public GET) danh mục khóa học, danh sách chủ đề và bài học để người dùng có thể duyệt catalog mà không bị chặn 401 Unauthorized khi chưa đăng nhập.
3. **Kiểm thử luồng học (Learning Flow):** Kiểm thử trang danh sách khóa học -> chi tiết khóa học -> vào chủ đề học (Mascot -> Từ vựng -> Lật flashcard -> Cập nhật tiến trình -> Quay lại).

---

## 2. Kết quả kiểm thử chi tiết

| Test Case ID | Kịch bản kiểm thử | Kết quả | Ghi chú |
| :--- | :--- | :--- | :--- |
| **CRS-TC-001** | Xem danh sách khóa học & phân trang | **PASS** | Tải danh sách khóa học mượt mà, phân trang đúng chuẩn 0-based index của Spring Boot. |
| **CRS-TC-002** | Xem chi tiết khóa học và khóa/mở topic | **PASS** | Hiển thị đầy đủ thông tin, chủ đề đầu mở khóa, các chủ đề sau khóa biểu tượng 🔒 chính xác. |
| **CRS-TC-003** | Luồng học chủ đề (Mascot & Flashcard) | **PASS** | Chuyển bước từ Mascot sang Từ vựng thành công; lật thẻ flashcard và lưu trạng thái "Đang học" chính xác. |
| **CRS-TC-004** | Quyền truy cập API & bảo mật | **PASS** | `GET /v1/courses/**` hoạt động công khai; các chức năng ghi nhận tiến trình yêu cầu token; Admin CRUD bảo vệ bằng `ROLE_ADMIN`. |

---

## 3. Các File Đã Chỉnh Sửa

- [SecurityConfig.java](file:///e:/web-hoc-tieng-anh/BE/src/main/java/com/example/app/config/SecurityConfig.java): Cho phép public GET cho các endpoint catalog khóa học, chủ đề và bài học.
- [CourseListPage.tsx](file:///e:/web-hoc-tieng-anh/FE-WebHocTiengAnh/src/components/pages/courses/CourseListPage.tsx): Đồng bộ hóa state phân trang `page: 0` với chuẩn Pagination component và Backend API.
- [course.md](file:///e:/web-hoc-tieng-anh/FE-WebHocTiengAnh/docs/test-cases/courses/course.md): Bổ sung tài liệu Test Cases chuẩn cho chức năng khóa học.
