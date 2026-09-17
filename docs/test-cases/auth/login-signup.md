# Test Cases: Auth - Login & Signup

Status: reviewed
Owner: TEST
Related:
  - Requirement: docs/requirements/auth/auth.md
  - API: docs/api/auth/auth.md
  - Security: docs/security/overview.md

## AUTH-TC-001 - Đăng nhập thất bại khi sai mật khẩu

Status: verified
Priority: high
Type: validation
Related:
  - Requirement: docs/requirements/auth/auth.md
  - Business rule: AUTH-BR-001, AUTH-BR-004

### Preconditions
- User đã có tài khoản trên hệ thống.

### Test Data
- Email: `tester_final_01@example.com`
- Password: `wrongpass`

### Steps
1. Truy cập `http://localhost:3000/auth/login`.
2. Nhập Email và Mật khẩu sai.
3. Nhấn "Đăng Nhập".

### Expected Results
- Hệ thống hiển thị thông báo lỗi rõ ràng: `Email hoặc mật khẩu không chính xác.`
- Không chuyển hướng trang.

### Automation
Manual & Browser Subagent verified

---

## AUTH-TC-002 - Kiểm tra validation form đăng ký

Status: verified
Priority: medium
Type: validation
Related:
  - Requirement: docs/requirements/auth/auth.md

### Preconditions
- Truy cập màn hình đăng ký `http://localhost:3000/auth/signup`.

### Test Data
- Case A: Bỏ trống các trường.
- Case B: Mật khẩu dưới 6 ký tự.
- Case C: Mật khẩu xác nhận không khớp (`password123` vs `password456`).

### Steps
1. Nhập thông tin theo từng case trên form.
2. Nhấn "Tạo Tài Khoản".

### Expected Results
- Case A: Hiển thị lỗi `Vui lòng điền đầy đủ thông tin`.
- Case B: Hiển thị lỗi `Mật khẩu phải có ít nhất 6 ký tự`.
- Case C: Hiển thị lỗi `Mật khẩu xác nhận không khớp`.

### Automation
Manual & Browser Subagent verified

---

## AUTH-TC-003 - Đăng ký tài khoản mới thành công

Status: verified
Priority: high
Type: functional
Related:
  - Requirement: docs/requirements/auth/auth.md
  - Business rule: AUTH-BR-002

### Preconditions
- Email chưa tồn tại trong hệ thống.

### Test Data
- Họ tên: `Nguyen Van A`
- Email: `tester_final_01@example.com`
- Password: `password123`
- Confirm Password: `password123`

### Steps
1. Truy cập `http://localhost:3000/auth/signup`.
2. Điền đầy đủ thông tin hợp lệ.
3. Nhấn "Tạo Tài Khoản".

### Expected Results
- Hiển thị thông báo `Đăng ký thành công! Chuyển hướng đến đăng nhập...`.
- Tự động chuyển hướng về `http://localhost:3000/auth/login`.

### Automation
Manual & Browser Subagent verified

---

## AUTH-TC-004 - Đăng nhập thành công và điều hướng Dashboard

Status: verified
Priority: high
Type: functional
Related:
  - Requirement: docs/requirements/auth/auth.md
  - Business rule: AUTH-BR-001, AUTH-BR-003

### Preconditions
- Tài khoản đã được tạo và kích hoạt.

### Test Data
- Email: `tester_final_01@example.com`
- Password: `password123`

### Steps
1. Truy cập `http://localhost:3000/auth/login`.
2. Nhập email và mật khẩu chính xác.
3. Nhấn "Đăng Nhập".

### Expected Results
- Lưu accessToken và refreshToken vào cookie / localStorage.
- Chuyển hướng đến `/dashboard` (hoặc redirect param nếu có).
- Sidebar hiển thị tên người dùng `Nguyen Van A`.

### Automation
Manual & Browser Subagent verified

---

## AUTH-TC-005 - Đăng xuất người dùng

Status: verified
Priority: high
Type: functional
Related:
  - Requirement: docs/requirements/auth/auth.md
  - Business rule: AUTH-BR-002

### Preconditions
- Người dùng đang ở trạng thái đã đăng nhập.

### Steps
1. Mở menu avatar người dùng ở sidebar.
2. Nhấn "Đăng xuất".

### Expected Results
- Phiên đăng nhập được xóa sạch (localStorage & cookie token).
- Chuyển hướng người dùng về màn hình đăng nhập `/auth/login`.

### Automation
Manual & Browser Subagent verified

---

## AUTH-TC-006 - Đăng ký với email đã tồn tại

Status: verified
Priority: high
Type: validation
Related:
  - Requirement: docs/requirements/auth/auth.md
  - Business rule: AUTH-BR-004

### Preconditions
- Email `tester_final_01@example.com` đã đăng ký trước đó.

### Steps
1. Truy cập `http://localhost:3000/auth/signup`.
2. Điền thông tin với email `tester_final_01@example.com`.
3. Nhấn "Tạo Tài Khoản".

### Expected Results
- Hệ thống bắt lỗi từ Backend và hiển thị `Email này đã được đăng ký. Vui lòng chọn email khác hoặc đăng nhập.`
- Không tạo trùng lặp tài khoản.

### Automation
Manual & Browser Subagent verified
