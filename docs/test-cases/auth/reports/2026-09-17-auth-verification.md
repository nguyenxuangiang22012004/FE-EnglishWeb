# Test Report - Auth (Login & Signup) - 2026-09-17

Status: pass
Tester: Antigravity AI
Environment: Local (FE: http://localhost:3000, BE: http://localhost:8080)
Build: Local workspace branch
Account: `tester_final_01@example.com` (role: user)
Related:
  - Test cases: docs/test-cases/auth/login-signup.md
  - Requirement: docs/requirements/auth/auth.md

## Scope
- Kiểm thử và sửa đổi chức năng Đăng ký (Signup), Đăng nhập (Login), Xác thực phiên (Session/Cookie/LocalStorage), Đăng xuất (Logout) và Xử lý lỗi (Validation & Backend Errors).

## Kết quả

| TC-ID | Scenario | Loại (Manual/Auto) | Kết quả | Bug |
| --- | --- | --- | --- | --- |
| AUTH-TC-001 | Đăng nhập thất bại khi sai mật khẩu | Auto (Subagent) | PASS | Đã tối ưu message |
| AUTH-TC-002 | Kiểm tra validation form đăng ký (rỗng, ngắn, lệch mật khẩu) | Auto (Subagent) | PASS | Không |
| AUTH-TC-003 | Đăng ký tài khoản mới thành công | Auto (Subagent) | PASS | Không |
| AUTH-TC-004 | Đăng nhập thành công và điều hướng Dashboard | Auto (Subagent) | PASS | Không |
| AUTH-TC-005 | Đăng xuất người dùng | Auto (Subagent) | PASS | Đã tối ưu UX confirm |
| AUTH-TC-006 | Đăng ký với email đã tồn tại | Auto (Subagent) | PASS | Đã tối ưu message |

## Cải tiến & Sửa đổi đã thực hiện
1. **LoginForm**:
   - Tối ưu hóa thông báo lỗi thân thiện bằng tiếng Việt (`Email hoặc mật khẩu không chính xác.`).
   - Xử lý chi tiết các mã lỗi `401`, `500` và trích xuất lỗi validation lồng nhau từ backend (`Validation Error`).
   - Hỗ trợ thời hạn cookie phiên khi tích chọn "Nhớ tôi" (Remember Me).
2. **SignupForm**:
   - Bắt lỗi trùng email từ Backend (`IllegalArgumentException: Email already exists`) và hiển thị thông báo rõ ràng: `"Email này đã được đăng ký. Vui lòng chọn email khác hoặc đăng nhập."`.
   - Bổ sung xử lý lỗi validation chi tiết.
3. **AvatarDropdown**:
   - Loại bỏ `window.confirm` chặn luồng trình duyệt, giúp thao tác đăng xuất mượt mà, tức thì và ổn định.
4. **AuthService**:
   - Điều chỉnh cấu hình lưu cookie với `rememberMe` (1 ngày vs 30 ngày).

## Evidence
- Browser session recording: `test_auth_full_1789635719948.webp`
- Screenshot duplicate email error: `duplicate_email_error_1789635977612.png`
