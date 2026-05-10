# Gemini Bridge API Documentation

Hệ thống sử dụng **JWT (JSON Web Token)** được lưu trữ trong **HttpOnly Cookie** để xác thực các yêu cầu.

## 1. Authentication

### Đăng nhập (Mock)
- **Endpoint:** `POST /api/auth/login`
- **Mô tả:** Kiểm tra thông tin đăng nhập và trả về một JWT Cookie.
- **Payload:**
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
- **Phản hồi thành công:**
  ```json
  {
    "message": "Login successful",
    "user": { "username": "admin" }
  }
  ```

### Đăng xuất
- **Endpoint:** `POST /api/auth/logout`
- **Mô tả:** Xóa Cookie chứa JWT.

---

## 2. AI Services (Protected)

### Tạo nội dung với Gemini
- **Endpoint:** `POST /api/ai/generate`
- **Bảo mật:** Yêu cầu `token` cookie hợp lệ.
- **Payload:**
  ```json
  {
    "prompt": "Viết một đoạn mã Express.js cơ bản"
  }
  ```
- **Phản hồi thành công:**
  ```json
  {
    "success": true,
    "data": "... nội dung từ AI ..."
  }
  ```
- **Phản hồi lỗi (401):**
  ```json
  { "message": "Authentication required" }
  ```
